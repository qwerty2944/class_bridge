-- 상점 기본 아이템 이름을 실제 Unity 스프라이트 그림에 맞게 교정.
-- (mud_web에서 전체 스프라이트를 스크린샷으로 확인해 인덱스별 이름을 확정한 결과 반영)
-- 예: armor:3 은 가죽이 아니라 백은 판금, helmet:4 는 학사모가 아니라 은투구.
-- 가격/레벨도 그림 등급에 맞게 조정 (armor:3 rare > armor:8 crude).

-- 1) 기존 테넌트들의 시드 아이템 교정 (asset_key + 기존 시드 이름으로만 매칭해
--    운영자가 직접 만든 커스텀 아이템은 건드리지 않는다)
update shop_items set name = '옆머리 넘긴 헤어', description = '한쪽으로 넘긴 자연스러운 앞머리'
  where asset_key = 'hair:1' and name = '단정한 헤어';
update shop_items set name = '포니테일', description = '높게 묶은 포니테일'
  where asset_key = 'hair:5' and name = '곱슬머리';
update shop_items set name = '상투 머리', description = '위로 틀어 올린 상투'
  where asset_key = 'hair:9' and name = '핑크 헤어';
update shop_items set name = '엘프풍 푸른 튜닉', description = '허리띠를 두른 푸른 튜닉'
  where asset_key = 'cloth:2' and name = '학생 교복';
update shop_items set name = '엘프풍 청색 띠 셔츠', description = '청색 띠 장식 셔츠'
  where asset_key = 'cloth:6' and name = '운동복';
update shop_items set name = '백은 판금 갑옷', description = '은빛으로 빛나는 판금 갑옷', price = 500, min_level = 5
  where asset_key = 'armor:3' and name = '가죽 갑옷';
update shop_items set name = '새싹 가죽 견갑', description = '새싹 장식이 달린 가죽 견갑', price = 250, min_level = 3
  where asset_key = 'armor:8' and name = '강철 갑옷';
update shop_items set name = '주황 볏 은투구', description = '주황 볏이 달린 백은 투구'
  where asset_key = 'helmet:4' and name = '학사모';
update shop_items set name = '갈색 망토', description = '짙은 갈색의 튼튼한 망토'
  where asset_key = 'back:2' and name = '용사의 망토';
update shop_items set name = '암살자의 단검', description = '붉은 손잡이의 날렵한 단검'
  where asset_key = 'weapon:dagger,1' and name = '나무 단검';

-- 2) 새 테넌트용 시드 함수도 동일하게 교정
create or replace function public.seed_default_shop_items(p_tenant_id uuid)
returns void language plpgsql as $$
begin
  insert into shop_items (tenant_id, name, description, category, asset_key, price, min_level) values
    (p_tenant_id, '옆머리 넘긴 헤어',   '한쪽으로 넘긴 자연스러운 앞머리', 'hair',   'hair:1',           50,  1),
    (p_tenant_id, '포니테일',           '높게 묶은 포니테일',              'hair',   'hair:5',          100,  2),
    (p_tenant_id, '상투 머리',          '위로 틀어 올린 상투',             'hair',   'hair:9',          200,  3),
    (p_tenant_id, '엘프풍 푸른 튜닉',   '허리띠를 두른 푸른 튜닉',         'cloth',  'cloth:2',          80,  1),
    (p_tenant_id, '엘프풍 청색 띠 셔츠','청색 띠 장식 셔츠',               'cloth',  'cloth:6',         150,  2),
    (p_tenant_id, '새싹 가죽 견갑',     '새싹 장식이 달린 가죽 견갑',      'armor',  'armor:8',         250,  3),
    (p_tenant_id, '백은 판금 갑옷',     '은빛으로 빛나는 판금 갑옷',       'armor',  'armor:3',         500,  5),
    (p_tenant_id, '주황 볏 은투구',     '주황 볏이 달린 백은 투구',        'helmet', 'helmet:4',        300,  4),
    (p_tenant_id, '갈색 망토',          '짙은 갈색의 튼튼한 망토',         'back',   'back:2',          350,  4),
    (p_tenant_id, '암살자의 단검',      '붉은 손잡이의 날렵한 단검',       'weapon', 'weapon:dagger,1', 120,  2)
  on conflict do nothing;
end; $$;
