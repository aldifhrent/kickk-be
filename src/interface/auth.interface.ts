export interface UserLogin {
  id?: string;
  name: string;
  organizerId?: string | undefined;
  organizerName?: string;
  email: string;
  password?: string;
  imageUrl?: string | null;
  role?: string;
}
