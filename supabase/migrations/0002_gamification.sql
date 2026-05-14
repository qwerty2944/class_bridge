-- 게이미피케이션: 학생 캐릭터 + 상점 + 인벤토리 + 보상 이벤트
-- mud_web 의 Unity WebGL 캐릭터 빌더 외형을 학원 학생에게 부여한다.

create table if not exists student_characters (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  name text,
  level int not null default 1,
  xp int not null default 0,
  coins int not null default 0,
  appearance jsonb not null default jsonb_build_object(
    'bodyIndex', 0, 'eyeIndex', 0, 'hairIndex', 0, 'facehairIndex', 0,
    'clothIndex', 0, 'armorIndex', 0, 'pantIndex', 0, 'helmetIndex', 0, 'backIndex', 0
  ),
  colors jsonb not null default jsonb_build_object(
    'body', '#f5d3a3', 'eye', '#4f46e5', 'hair', '#222222', 'facehair', '#222222',
    'cloth', '#3b82f6', 'armor', '#9ca3af', 'pant', '#1f2937'
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, user_id)
);
create index if not exists student_characters_tenant_user_idx on student_characters(tenant_id, user_id);

create table if not exists shop_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  description text,
  category text not null check (category in ('hair','cloth','armor','pant','helmet','back','weapon','accessory')),
  asset_key text not null,    -- 예: "armor:7", "weapon:sword,3"
  payload jsonb default '{}'::jsonb,
  icon_url text,
  price int not null,
  min_level int not null default 1,
  created_at timestamptz not null default now()
);
create index if not exists shop_items_tenant_idx on shop_items(tenant_id);

create table if not exists character_inventory (
  id uuid primary key default gen_random_uuid(),
  character_id uuid not null references student_characters(id) on delete cascade,
  shop_item_id uuid not null references shop_items(id) on delete cascade,
  equipped boolean not null default false,
  acquired_at timestamptz not null default now(),
  unique (character_id, shop_item_id)
);
create index if not exists inventory_char_idx on character_inventory(character_id);

create table if not exists reward_events (
  id uuid primary key default gen_random_uuid(),
  character_id uuid not null references student_characters(id) on delete cascade,
  source text not null check (source in ('assignment_grade','admin','level_bonus')),
  source_ref uuid,
  xp_delta int not null default 0,
  coin_delta int not null default 0,
  note text,
  created_at timestamptz not null default now(),
  unique (character_id, source, source_ref)  -- 같은 채점 row에 중복 보상 방지
);
create index if not exists reward_events_char_idx on reward_events(character_id, created_at desc);

-- RLS 비활성화 (사용자 지시)
alter table student_characters disable row level security;
alter table shop_items disable row level security;
alter table character_inventory disable row level security;
alter table reward_events disable row level security;

-- 기본 상점 시드: 학원 추가 시 트리거로 10개 아이템 자동 생성
create or replace function public.seed_default_shop_items(p_tenant_id uuid)
returns void language plpgsql as $$
begin
  insert into shop_items (tenant_id, name, description, category, asset_key, price, min_level) values
    (p_tenant_id, '단정한 헤어', '깔끔하게 정돈된 헤어',   'hair',   'hair:1',     50,  1),
    (p_tenant_id, '곱슬머리',     '자연스러운 컬',         'hair',   'hair:5',    100,  2),
    (p_tenant_id, '핑크 헤어',    '튀는 핑크 컬러',        'hair',   'hair:9',    200,  3),
    (p_tenant_id, '학생 교복',    '단정한 교복',           'cloth',  'cloth:2',    80,  1),
    (p_tenant_id, '운동복',       '활동적인 트레이닝복',   'cloth',  'cloth:6',   150,  2),
    (p_tenant_id, '가죽 갑옷',    '튼튼한 가죽 갑옷',      'armor',  'armor:3',   250,  3),
    (p_tenant_id, '강철 갑옷',    '단단한 풀플레이트',     'armor',  'armor:8',   500,  5),
    (p_tenant_id, '학사모',       '졸업의 상징',           'helmet', 'helmet:4',  300,  4),
    (p_tenant_id, '용사의 망토',  '바람에 휘날리는 망토',  'back',   'back:2',    350,  4),
    (p_tenant_id, '나무 단검',    '입문자용 단검',         'weapon', 'weapon:dagger,1', 120, 2)
  on conflict do nothing;
end; $$;

-- 기존 테넌트들에도 적용
do $$ declare t record;
begin
  for t in select id from tenants loop
    perform public.seed_default_shop_items(t.id);
  end loop;
end; $$;

-- 새 테넌트 자동 시드 트리거
create or replace function public.on_tenant_created_seed_shop() returns trigger language plpgsql as $$
begin
  perform public.seed_default_shop_items(new.id);
  return new;
end; $$;

drop trigger if exists tenants_seed_shop on tenants;
create trigger tenants_seed_shop
  after insert on tenants
  for each row execute function public.on_tenant_created_seed_shop();
