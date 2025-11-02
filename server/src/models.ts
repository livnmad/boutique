export interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Item {
  title: string;
  description: string;
  price: number;
  imageSvg?: string;
  inventory: number;
  averageRating?: number;
  reviews?: Review[];
  createdAt: string;
}

export interface ItemResponse extends Item {
  id: string;
}