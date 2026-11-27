export type ChildTagVariant = "allergy" | "link";

export type ChildTag = {
  label: string;
  variant: ChildTagVariant;
};

export type LinkedParentStatus = "active" | "pending";

export type LinkedParent = {
  name: string;
  initial: string;
  avatarColor: string;
  textColor: string;
  relation: string;
  status: LinkedParentStatus;
  statusText: string;
};

export type Child = {
  id: string;
  name: string;
  initial: string;
  avatarSize: number;
  avatarColor: string;
  textColor: string;
  age: string;
  linkedParentsCount: number;
  subtitle: string;
  tags: ChildTag[];
};

export type ChildProfile = Child & {
  room: string;
  dob: string;
  enrolled: string;
  healthNote: string;
  parents: LinkedParent[];
};

export const mockChildren: Child[] = [
  {
    id: "matthew-fernandez",
    name: "Matthew Fernandez",
    initial: "M",
    avatarSize: 48,
    avatarColor: "#A9D9E8",
    textColor: "#1F7A93",
    age: "3 years",
    linkedParentsCount: 2,
    subtitle: "3 years · 2 linked parents",
    tags: [{ label: "PEANUT", variant: "allergy" }],
  },
  {
    id: "sophia-mendez",
    name: "Sophia Mendez",
    initial: "S",
    avatarSize: 48,
    avatarColor: "#F4B8CC",
    textColor: "#C44A7A",
    age: "2 years",
    linkedParentsCount: 1,
    subtitle: "2 years · 1 linked parent",
    tags: [],
  },
  {
    id: "benjamin-ruiz",
    name: "Benjamin Ruiz",
    initial: "B",
    avatarSize: 48,
    avatarColor: "#B9DEC4",
    textColor: "#3E8B62",
    age: "3 years",
    linkedParentsCount: 2,
    subtitle: "3 years · 2 linked parents",
    tags: [],
  },
  {
    id: "valentina-soto",
    name: "Valentina Soto",
    initial: "V",
    avatarSize: 48,
    avatarColor: "#F4DC8E",
    textColor: "#9A7B1E",
    age: "2 years",
    linkedParentsCount: 0,
    subtitle: "2 years · no linked parents",
    tags: [{ label: "LINK", variant: "link" }],
  },
  {
    id: "thomas-diaz",
    name: "Thomas Diaz",
    initial: "T",
    avatarSize: 48,
    avatarColor: "#C9B6E8",
    textColor: "#7B5FC0",
    age: "3 years",
    linkedParentsCount: 1,
    subtitle: "3 years · 1 linked parent",
    tags: [{ label: "LACTOSE", variant: "allergy" }],
  },
  {
    id: "emma-castro",
    name: "Emma Castro",
    initial: "E",
    avatarSize: 48,
    avatarColor: "#F4B8CC",
    textColor: "#C44A7A",
    age: "2 years",
    linkedParentsCount: 1,
    subtitle: "2 years · 1 linked parent",
    tags: [],
  },
  {
    id: "lucas-romero",
    name: "Lucas Romero",
    initial: "L",
    avatarSize: 48,
    avatarColor: "#A9D9E8",
    textColor: "#1F7A93",
    age: "3 years",
    linkedParentsCount: 1,
    subtitle: "3 years · 1 linked parent",
    tags: [],
  },
  {
    id: "olivia-vega",
    name: "Olivia Vega",
    initial: "O",
    avatarSize: 48,
    avatarColor: "#B9DEC4",
    textColor: "#3E8B62",
    age: "2 years",
    linkedParentsCount: 1,
    subtitle: "2 years · 1 linked parent",
    tags: [],
  },
];

export const mockChildProfiles: Record<string, ChildProfile> = {
  "matthew-fernandez": {
    id: "matthew-fernandez",
    name: "Matthew Fernandez",
    initial: "M",
    avatarSize: 84,
    avatarColor: "#A9D9E8",
    textColor: "#1F7A93",
    age: "3 years",
    linkedParentsCount: 2,
    subtitle: "3 years · Sunshine Room",
    tags: [{ label: "PEANUT", variant: "allergy" }],
    room: "Sunshine",
    dob: "Mar 12, 2022",
    enrolled: "Feb 2025",
    healthNote:
      "Peanut allergy. Avoid tree nuts. He keeps an inhaler in his backpack.",
    parents: [
      {
        name: "Lucy Fernandez",
        initial: "L",
        avatarColor: "#C9B6E8",
        textColor: "#fff",
        relation: "Mom",
        status: "active",
        statusText: "active",
      },
      {
        name: "Diego Fernandez",
        initial: "D",
        avatarColor: "#A9C7E8",
        textColor: "#fff",
        relation: "Dad",
        status: "pending",
        statusText: "invitation sent",
      },
    ],
  },
};
