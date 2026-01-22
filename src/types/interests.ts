// ApiRequestResult is imported from @types/auth where needed

// Tag structure from API
export interface Tag {
  id: number;
  name_es: string;
  name_en: string;
  slug: string;
}

// User Interest structure
export interface UserInterest {
  id: number;
  tag: Tag;
  tag_name_es: string;
  tag_name_en: string;
  tag_slug: string;
  created_at: string;
  updated_at: string;
}

// Available tag with selection status
export interface AvailableTag extends Tag {
  is_selected: boolean;
}

// GET /api/users/interests/
export interface GetInterestsResponse {
  success: boolean;
  interests: UserInterest[];
  count: number;
  message?: string;
}

// POST /api/users/interests/add/
export interface AddInterestPayload {
  tag: number;
}

export interface AddInterestResponse {
  success: boolean;
  message: string;
  interest?: UserInterest;
  errors?: Record<string, string[]>;
}

// PUT /api/users/interests/update/
export interface UpdateInterestsPayload {
  tag_ids: number[];
}

export interface UpdateInterestsResponse {
  success: boolean;
  message: string;
  interests: UserInterest[];
  count: number;
  errors?: Record<string, string[]>;
}

// DELETE /api/users/interests/delete/{id}/
export interface DeleteInterestResponse {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}

// GET /api/users/interests/available-tags/
export interface GetAvailableTagsResponse {
  success: boolean;
  tags: AvailableTag[];
  count: number;
  selected_count: number;
  message?: string;
}

