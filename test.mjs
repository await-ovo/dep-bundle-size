import got from 'got';
import { table } from 'table';

// const main = async () => {
//   try {
//     const res = await got(
//       'https://bundlephobia.com/api/size?package=got@12.5.3&record=true',
//       // 'https://bundlephobia.com/api/size?package=p-limit@4.0.0&record=true',
//       {
//         // headers: {
//         //   'User-Agent': 'bundle-phobia-cli',
//         //   'X-Bundlephobia-User': 'bundle-phobia-cli',
//         // },
//       },
//     ).json();
//   } catch (err) {
//     console.log(`err --->`, JSON.parse(err.response.body));
//   }

//   // console.log(`res -->`, res);
// };

// main();

const json = [
  {
    dependencyCount: 1,
    description: 'React is a JavaScript library for building user interfaces.',
    gzip: 2567,
    hasJSModule: false,
    hasJSNext: false,
    hasSideEffects: true,
    isModuleType: false,
    name: 'react',
    repository: 'https://github.com/facebook/react.git',
    scoped: false,
    size: 6588,
    version: '18.2.0',
  },
  {
    dependencyCount: 1,
    description:
      'Run multiple promise-returning & async functions with limited concurrency',
    gzip: 657,
    hasJSModule: false,
    hasJSNext: false,
    hasSideEffects: true,
    isModuleType: true,
    name: 'p-limit',
    repository: 'https://github.com/sindresorhus/p-limit.git',
    scoped: false,
    size: 1170,
    version: '4.0.0',
  },
  {
    dependencyCount: 1,
    description: 'Declarative routing for React',
    gzip: 15807,
    hasJSModule: './dist/index.js',
    hasJSNext: false,
    hasSideEffects: false,
    isModuleType: false,
    name: 'react-router',
    peerDependencies: ['react'],
    repository: 'https://github.com/remix-run/react-router.git',
    scoped: false,
    size: 49095,
    version: '6.8.1',
  },
];

console.log(
  table(
    [
      ['Name', `MIN`, 'MIN + GZIP', 'SLOW 3G', 'EMERGING 4G'],
      ...json.map(record => [
        `${record.name}@${record.version}`,
        `${(record.size / 1024).toFixed(2)} kB`,
        `${(record.gzip / 1024).toFixed(2)} kB`,
        '0 ms',
        '0 ms',
      ]),
    ],
    {
      header: {
        alignment: 'center',
        content: 'Results',
      },
    },
  ),
);
