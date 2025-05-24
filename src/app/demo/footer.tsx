import { FC } from 'react';

const Footer: FC = () => {
  return (
    <>
      <div
      className="
        w-full
        bg-white pt-4
        sm:pt-10 lg:pt-12
        mt-auto
      ">
        <footer
        className="
          mx-auto max-w-screen-2xl
          w-full
          px-4 md:px-8
        ">
          <div
          className="
            flex flex-col
            items-center border-t
            pt-6
          ">
          </div>
          <div
          className="
            py-8 text-center
            text-sm text-gray-400
          ">
            © 2025 - Present Blog. All rights reserved.
          </div>
        </footer>
      </div>
    </>
  );
};
export default Footer;