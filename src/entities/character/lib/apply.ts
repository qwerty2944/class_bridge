import type { CharacterAppearance, CharacterColors } from '@/shared/unity/types';

type SendFn = (method: string, param?: string | number) => void;

// Unity (SPUM characterbuilder) 호출 규약 — mud_web 의 canonical reference 와 동기:
// 1) 인덱스 파라미터는 반드시 string ('0'..'N', 또는 '-1').
// 2) 색상은 '#' 없는 6자리 hex.
// 3) 옵션 파츠(머리/얼굴털/옷/갑옷/바지/투구/망토) 는 '-1' 을 보내야 파츠가 제거된다.
//    호출을 생략하면 직전 프레임 값이 그대로 남아 '없음' 선택이 반영되지 않는다.
// 4) 필수 파츠(몸/눈) 는 -1 의미가 없으므로 idx >= 0 일 때만 보낸다.
// 5) 무기는 별도 — JS_Clear[Right|Left]Weapon 로 비우고 JS_Set[Right|Left]Weapon(type,idx) 로 장착.

const strip = (hex: string | undefined | null) => (hex ?? '').replace('#', '');
const ix = (n: number) => Math.trunc(n).toString();
const sendOpt = (send: SendFn, method: string, n: number | null | undefined) => {
  if (typeof n === 'number' && n >= -1) send(method, ix(n));
};

export function applyAppearance(send: SendFn, a: CharacterAppearance) {
  // 매 적용마다 무기를 먼저 비운다. 이후 CharacterView 의 inventory.equipped 가
  // applyAssetKey 로 무기를 다시 세팅. 무기 미장착 캐릭터는 깔끔하게 빈손.
  send('JS_ClearRightWeapon');
  send('JS_ClearLeftWeapon');

  if (a.bodyIndex >= 0) send('JS_SetBody', ix(a.bodyIndex));
  if (a.eyeIndex >= 0) send('JS_SetEye', ix(a.eyeIndex));
  sendOpt(send, 'JS_SetHair', a.hairIndex);
  sendOpt(send, 'JS_SetFacehair', a.facehairIndex);
  sendOpt(send, 'JS_SetCloth', a.clothIndex);
  sendOpt(send, 'JS_SetArmor', a.armorIndex);
  sendOpt(send, 'JS_SetPant', a.pantIndex);
  sendOpt(send, 'JS_SetHelmet', a.helmetIndex);
  sendOpt(send, 'JS_SetBack', a.backIndex);
}

export function applyColors(send: SendFn, c: CharacterColors) {
  if (c.body) send('JS_SetBodyColor', strip(c.body));
  if (c.hair) send('JS_SetHairColor', strip(c.hair));
  if (c.facehair) send('JS_SetFacehairColor', strip(c.facehair));
  if (c.cloth) send('JS_SetClothColor', strip(c.cloth));
  if (c.armor) send('JS_SetArmorColor', strip(c.armor));
  if (c.pant) send('JS_SetPantColor', strip(c.pant));
  if (c.eye) {
    const hex = strip(c.eye);
    send('JS_SetLeftEyeColor', hex);
    send('JS_SetRightEyeColor', hex);
  }
}

export function applyAssetKey(send: SendFn, assetKey: string) {
  const [kind, value] = assetKey.split(':');
  if (!kind || !value) return;
  switch (kind) {
    case 'hair':
      send('JS_SetHair', ix(Number(value)));
      break;
    case 'cloth':
      send('JS_SetCloth', ix(Number(value)));
      break;
    case 'armor':
      send('JS_SetArmor', ix(Number(value)));
      break;
    case 'pant':
      send('JS_SetPant', ix(Number(value)));
      break;
    case 'helmet':
      send('JS_SetHelmet', ix(Number(value)));
      break;
    case 'back':
      send('JS_SetBack', ix(Number(value)));
      break;
    case 'weapon':
      // value 는 "타입,index" 형태 (예: "dagger,1") — JS_SetRightWeapon 이 그대로 받음.
      send('JS_SetRightWeapon', value);
      break;
    case 'shield':
      send('JS_SetLeftWeapon', `Shield,${Number(value)}`);
      break;
    default:
      break;
  }
}
