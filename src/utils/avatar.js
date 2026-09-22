export const avatar = (person) =>
  person?.avatar_url ||
  `https://ui-avatars.com/api/?name=${encodeURIComponent(
    person?.full_name || "U"
  )}&background=635bff&color=fff`;
