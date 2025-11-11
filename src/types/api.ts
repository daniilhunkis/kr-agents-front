export interface EstateObject {
  id: number;
  title: string;
  price: number;
  address: string;
  description?: string | null;
  developer?: string | null;
  owner_id: number;
  status: "pending" | "approved" | "rejected" | string;
}
