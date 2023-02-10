export const add = (
  packages: string[],
  options: {
    interactive?: boolean;
    warning?: boolean;
  },
) => {
  console.log('command add ----->', packages, options);
};
