// The overlay ships in Light only. Dark and Brand were A/B candidates: their
// tokens and Brand's backdrop/heading stay in place, unused, should they return.
export type GuideTheme = "dark" | "light" | "brand";

export const guideTheme = (): GuideTheme => "light";
