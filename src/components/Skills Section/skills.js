import {
  siBootstrap,
  siCss,
  siExpress,
  siFirebase,
  siHtml5,
  siJavascript,
  siJsonwebtokens,
  siMongodb,
  siMongoose,
  siMysql,
  siNodedotjs,
  siPostman,
  siReact,
  siTailwindcss,
  siThreedotjs,
  siTypescript,
} from 'simple-icons'

// TODO: replace with your own skills.
// Each group becomes an orbit ring around the core in the 3D scene (first group = outermost
// ring), and each skill a logo travelling on it.
// Logos come from simple-icons: find a brand on https://simpleicons.org and import it
// as si<Name> (e.g. siRedux, siNextdotjs). Groups can be added or removed freely.
export const skillGroups = [
  {
    name: 'Frontend',
    skills: [
      { name: 'React', icon: siReact },
      { name: 'JavaScript', icon: siJavascript },
      { name: 'TypeScript', icon: siTypescript },
      { name: 'HTML5', icon: siHtml5 },
      { name: 'CSS', icon: siCss },
      { name: 'Tailwind CSS', icon: siTailwindcss },
      { name: 'Bootstrap', icon: siBootstrap },
      { name: 'Three.js', icon: siThreedotjs },
    ],
  },
  {
    name: 'Backend',
    skills: [
      { name: 'Node.js', icon: siNodedotjs },
      { name: 'Express', icon: siExpress },
      { name: 'JWT', icon: siJsonwebtokens },
      { name: 'Postman', icon: siPostman },
    ],
  },
  {
    name: 'Database',
    skills: [
      { name: 'MongoDB', icon: siMongodb },
      { name: 'Mongoose', icon: siMongoose },
      { name: 'MySQL', icon: siMysql },
      { name: 'Firebase', icon: siFirebase },
    ],
  },
]
