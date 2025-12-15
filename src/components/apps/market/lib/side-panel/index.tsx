import React from 'react';
import Image from 'next/image';

interface Props {
  // Add your prop types here
}

const SidePanel: React.FC<Props> = ({}) => {
  // const userProfile = {
  //   profilePicUrl: '/assets/imgs/woman-face.jpg',
  //   userName: 'queenie_ng',
  //   name: 'Queen Esther',
  // };
  return (
    <div>
      {/* <SidePanelUserAccount userProfile={userProfile} />
      <PopularVendors /> */}
      {/* <ComingSoon header={<div className="text-[28px] font-bold">Vendor Store</div>} /> */}
      <Image
        priority
        src={`/assets/imgs/odg-model-talk-2.png`}
        alt="odg-model"
        width={500}
        height={60}
        className="mx-auto"
      />
    </div>
  );
};

export default SidePanel;
