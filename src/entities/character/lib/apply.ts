import type { CharacterAppearance, CharacterColors } from '@/shared/unity/types';

type SendFn = (method: string, param?: string | number) => void;

// Unity (SPUM characterbuilder) 호출 규약 — mud_web 의 canonical reference 와 동기:
// 1) 인덱스 파라미터는 반드시 string ('0'..'N').
// 2) 색상은 '#' 없는 6자리 hex.
// 3) idx < 0 이면 호출 생략 (Unity 에서 해당 파츠를 떼고 싶을 때만 -1 전달).
// 4) 무기는 별도 — JS_Clear[Right|Left]Weapon 로 비우고 JS_Set[Right|Left]Weapon(type,idx) 로 장착.

const strip = (hex: string | undefined | null) => (hex ?? '').replace('#', '');
const ix = (n: number) => Math.trunc(n).toString();

export function applyAppearance(send: SendFn, a: CharacterAppearance) {
  // 매 적용마다 무기를 먼저 비운다. 이후 CharacterView 의 inventory.equipped 가
  // applyAssetKey 로 무기를 다시 세팅. 무기 미장착 캐릭터는 깔끔하게 빈손.
  send('JS_ClearRightWeapon');
  send('JS_ClearLeftWeapon');

  if (a.bodyIndex >= 0) send('JS_SetBody', ix(a.bodyIndex));
  if (a.eyeIndex >= 0) send('JS_SetEye', ix(a.eyeIndex));
  if (a.hairIndex >= 0) send('JS_SetHair', ix(a.hairIndex));
  if (a.facehairIndex >= 0) send('JS_SetFacehair', ix(a.facehairIndex));
  if (a.clothIndex >= 0) send('JS_SetCloth', ix(a.clothIndex));
  if (a.armorIndex >= 0) send('JS_SetArmor', ix(a.armorIndex));
  if (a.pantIndex >= 0) send('JS_SetPant', ix(a.pantIndex));
  if (a.helmetIndex >= 0) send('JS_SetHelmet', ix(a.helmetIndex));
  if (a.backIndex >= 0) send('JS_SetBack', ix(a.backIndex));
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
