export interface Item {
  title: string;
  description: string;
  price: number;
  imageSvg?: string;
  inventory: number;
}

export interface ItemResponse extends Item {
  id: string;
}