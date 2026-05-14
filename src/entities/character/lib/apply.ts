import type { CharacterAppearance, CharacterColors } from '@/shared/unity/types';

type SendFn = (method: string, param?: string | number) => void;

export function applyAppearance(send: SendFn, a: CharacterAppearance) {
  send('JS_SetBody', a.bodyIndex);
  send('JS_SetHair', a.hairIndex);
  send('JS_SetFacehair', a.facehairIndex);
  send('JS_SetCloth', a.clothIndex);
  send('JS_SetArmor', a.armorIndex);
  send('JS_SetPant', a.pantIndex);
  send('JS_SetHelmet', a.helmetIndex);
  send('JS_SetBack', a.backIndex);
}

export function applyColors(send: SendFn, c: CharacterColors) {
  send('JS_SetHairColor', c.hair);
  send('JS_SetFacehairColor', c.facehair);
  send('JS_SetClothColor', c.cloth);
  send('JS_SetArmorColor', c.armor);
  send('JS_SetPantColor', c.pant);
  send('JS_SetLeftEyeColor', c.eye);
  send('JS_SetRightEyeColor', c.eye);
}

export function applyAssetKey(send: SendFn, assetKey: string) {
  const [kind, value] = assetKey.split(':');
  if (!kind || !value) return;
  switch (kind) {
    case 'hair':
      send('JS_SetHair', Number(value));
      break;
    case 'cloth':
      send('JS_SetCloth', Number(value));
      break;
    case 'armor':
      send('JS_SetArmor', Number(value));
      break;
    case 'pant':
      send('JS_SetPant', Number(value));
      break;
    case 'helmet':
      send('JS_SetHelmet', Number(value));
      break;
    case 'back':
      send('JS_SetBack', Number(value));
      break;
    case 'weapon':
      send('JS_SetRightWeapon', value);
      break;
    default:
      break;
  }
}
