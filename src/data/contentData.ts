export interface ContentItem {
  title: string;
  content: React.ReactNode;
}

export interface ListContentItem {
  title: string;
  subtitle?: string;
  details: string[];
}

export interface ContentData {
  aboutMe: {
    title: string;
    paragraphs: string[];
  };
  projects: {
    title: string;
    items: ListContentItem[];
  };
  experience: {
    title: string;
    items: ListContentItem[];
  };
}

const contentData: ContentData = {
  aboutMe: {
    title: "About Me",
    paragraphs: [
      "Hi! I'm Josh Melgar, a full-stack software engineer with a passion for creating cool stuff.",
      "some random stuff here.",
      "some random stuff here.",
      "Extra paragraph for scrolling test.",
      "Extra paragraph for scrolling test.",
      "Extra paragraph for scrolling test.",
      "Extra paragraph for scrolling test."
    ]
  },
  projects: {
    title: "Projects",
    items: [
      {
        title: "Dark Matter Mapper",
        details: [
          "Project for this random stuf blah blah blah blah",
          "Extra details for scrolling test.",
          "More details for scrolling test."
        ]
      },
      {
        title: "Meal Planner",
        details: [
          "that one project test project - 1234567890.",
          "Extra details for scrolling test.",
          "More details for scrolling test."
        ]
      },
      {
        title: "something else idk",
        details: [
          "hello hello hello.",
          "Extra details for scrolling test.",
          "More details for scrolling test."
        ]
      }
    ]
  },
  experience: {
    title: "Experience",
    items: [
      {
        title: "Software Engineer II",
        subtitle: "Dick's Sporting Goods • 2023 - Present",
        details: [
          "Thing 1.",
          "Thing 2.",
          "Thing 3.",
          "Thing 4.",
          "Thing 5."
        ]
      },
      {
        title: "Network Engineer Intern",
        subtitle: "Dick's Sporting Goods • 2022",
        details: [
          "Thing 1.",
          "Thing 2.",
          "Thing 3 - extra content for scrolling test.",
          "Thing 4 - extra content for scrolling test.",
          "Thing 5 - extra content for scrolling test.",
          "Thing 6 - extra content for scrolling test.",
          "Thing 7 - extra content for scrolling test."
        ]
      }
    ]
  }
};

export default contentData; 