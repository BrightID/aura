import { Trans } from 'react-i18next';

const CustomTrans: typeof Trans = ({ ...args }) => {
  return (
    <Trans
      {...args}
      components={{
        ...args.components,
        br: <br />,
        strong: <strong className="font-bold" />,
      }}
    />
  );
};

export default CustomTrans;
