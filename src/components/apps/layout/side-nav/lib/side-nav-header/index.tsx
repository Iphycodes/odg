import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React from 'react';

interface Props {
  // Add your prop types here
  toggleSider: boolean;
}

const SideNavHeader: React.FC<Props> = ({ toggleSider }) => {
  const { push } = useRouter();
  return (
    <div className="flex flex-col justify-start min-h-20 items-start gap-10 py-2 mt-5 px-5">
      {!toggleSider && (
        <div className="flex justify-between w-full items-center">
          <span className="cursor-pointer" onClick={() => push('/')}>
            <Image
              priority
              src={`/assets/imgs/odg-logo-new.png`}
              alt="odg-logo"
              width={180}
              height={40}
            />
          </span>
        </div>
      )}
    </div>
  );
};

export default SideNavHeader;
