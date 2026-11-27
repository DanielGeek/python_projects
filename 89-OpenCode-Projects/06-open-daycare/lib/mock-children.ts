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
  "sophia-mendez": {
    id: "sophia-mendez",
    name: "Sophia Mendez",
    initial: "S",
    avatarSize: 84,
    avatarColor: "#F4B8CC",
    textColor: "#C44A7A",
    age: "2 years",
    linkedParentsCount: 1,
    subtitle: "2 years · Sunshine Room",
    tags: [],
    room: "Sunshine",
    dob: "Aug 5, 2023",
    enrolled: "Apr 2025",
    healthNote: "No known allergies. EpiPen kept in the nurse's office.",
    parents: [
      {
        name: "Carolina Mendez",
        initial: "C",
        avatarColor: "#F4B8CC",
        textColor: "#fff",
        relation: "Mom",
        status: "active",
        statusText: "active",
      },
    ],
  },
  "benjamin-ruiz": {
    id: "benjamin-ruiz",
    name: "Benjamin Ruiz",
    initial: "B",
    avatarSize: 84,
    avatarColor: "#B9DEC4",
    textColor: "#3E8B62",
    age: "3 years",
    linkedParentsCount: 2,
    subtitle: "3 years · Sunshine Room",
    tags: [],
    room: "Sunshine",
    dob: "Jan 20, 2022",
    enrolled: "Mar 2025",
    healthNote: "No known allergies.",
    parents: [
      {
        name: "Ana Ruiz",
        initial: "A",
        avatarColor: "#B9DEC4",
        textColor: "#fff",
        relation: "Mom",
        status: "active",
        statusText: "active",
      },
      {
        name: "Roberto Ruiz",
        initial: "R",
        avatarColor: "#A9D9E8",
        textColor: "#fff",
        relation: "Dad",
        status: "active",
        statusText: "active",
      },
    ],
  },
  "valentina-soto": {
    id: "valentina-soto",
    name: "Valentina Soto",
    initial: "V",
    avatarSize: 84,
    avatarColor: "#F4DC8E",
    textColor: "#9A7B1E",
    age: "2 years",
    linkedParentsCount: 0,
    subtitle: "2 years · Sunshine Room",
    tags: [{ label: "LINK", variant: "link" }],
    room: "Sunshine",
    dob: "Nov 8, 2023",
    enrolled: "Jun 2025",
    healthNote: "Lactose intolerant. Milk-free diet.",
    parents: [],
  },
  "thomas-diaz": {
    id: "thomas-diaz",
    name: "Thomas Diaz",
    initial: "T",
    avatarSize: 84,
    avatarColor: "#C9B6E8",
    textColor: "#7B5FC0",
    age: "3 years",
    linkedParentsCount: 1,
    subtitle: "3 years · Sunshine Room",
    tags: [{ label: "LACTOSE", variant: "allergy" }],
    room: "Sunshine",
    dob: "May 3, 2022",
    enrolled: "Jan 2025",
    healthNote: "Lactose intolerance. Dairy-free snacks provided by parents.",
    parents: [
      {
        name: "María Diaz",
        initial: "M",
        avatarColor: "#C9B6E8",
        textColor: "#fff",
        relation: "Mom",
        status: "active",
        statusText: "active",
      },
    ],
  },
  "emma-castro": {
    id: "emma-castro",
    name: "Emma Castro",
    initial: "E",
    avatarSize: 84,
    avatarColor: "#F4B8CC",
    textColor: "#C44A7A",
    age: "2 years",
    linkedParentsCount: 1,
    subtitle: "2 years · Sunshine Room",
    tags: [],
    room: "Sunshine",
    dob: "Sep 15, 2023",
    enrolled: "May 2025",
    healthNote: "No known allergies.",
    parents: [
      {
        name: "Laura Castro",
        initial: "L",
        avatarColor: "#F4B8CC",
        textColor: "#fff",
        relation: "Mom",
        status: "active",
        statusText: "active",
      },
    ],
  },
  "lucas-romero": {
    id: "lucas-romero",
    name: "Lucas Romero",
    initial: "L",
    avatarSize: 84,
    avatarColor: "#A9D9E8",
    textColor: "#1F7A93",
    age: "3 years",
    linkedParentsCount: 1,
    subtitle: "3 years · Sunshine Room",
    tags: [],
    room: "Sunshine",
    dob: "Feb 28, 2022",
    enrolled: "Apr 2025",
    healthNote: "No known allergies. Uses glasses for reading.",
    parents: [
      {
        name: "Carlos Romero",
        initial: "C",
        avatarColor: "#A9D9E8",
        textColor: "#fff",
        relation: "Dad",
        status: "active",
        statusText: "active",
      },
    ],
  },
  "olivia-vega": {
    id: "olivia-vega",
    name: "Olivia Vega",
    initial: "O",
    avatarSize: 84,
    avatarColor: "#B9DEC4",
    textColor: "#3E8B62",
    age: "2 years",
    linkedParentsCount: 1,
    subtitle: "2 years · Sunshine Room",
    tags: [],
    room: "Sunshine",
    dob: "Jul 11, 2023",
    enrolled: "Feb 2025",
    healthNote: "No known allergies.",
    parents: [
      {
        name: "Sofía Vega",
        initial: "S",
        avatarColor: "#B9DEC4",
        textColor: "#fff",
        relation: "Mom",
        status: "pending",
        statusText: "invitation sent",
      },
    ],
  },
};
