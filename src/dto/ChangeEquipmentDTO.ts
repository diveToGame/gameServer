export type ChangeEquipmentDTO = {
  equipment: {
    helmetId: number;
    weaponId: number;
    shoesId: number;
    accessaryId: number;
  };
}

// 10000 -> 헬멧
// 20000 -> 무기
// 30000 -> 신발
// 40000 -> 악세