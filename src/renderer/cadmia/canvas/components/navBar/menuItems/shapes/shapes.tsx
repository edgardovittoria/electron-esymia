import { FC, Fragment } from 'react';
import { Popover, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import {
  baseShapes,
  useAddToTheSceneANewShape,
} from './useAddToTheSceneANewShape';
import { IoCubeOutline } from 'react-icons/io5';
import { BiCylinder } from 'react-icons/bi';
import { TbCone, TbSphere } from 'react-icons/tb';
import { GiRing } from 'react-icons/gi';
import {
  navbarDropdownBoxStyle,
  navbarDropdownItemStyle,
  navbarDropdownPadding,
  navbarDropdownStyle
} from '../../../../../config/styles';
import { useDispatch } from 'react-redux';
import { setModality } from '../../../cadmiaModality/cadmiaModalitySlice';
import { useCadmiaModalityManager } from '../../../cadmiaModality/useCadmiaModalityManager';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export const iconForA = (shape: string) => {
  switch (shape) {
    case 'Brick':
      return <IoCubeOutline size={20} />;
    case 'Cylinder':
      return <BiCylinder size={20} />;
    case 'Cone':
      return <TbCone size={20} />;
    case 'Sphere':
      return <TbSphere size={20} />;
    case 'Torus':
      return <GiRing size={20} />;
    default:
      break;
  }
};

export const Shapes: FC = () => {
  const { addToTheSceneANew } = useAddToTheSceneANewShape();
  const { setOpacityNormalMode } = useCadmiaModalityManager()
  const dispatch = useDispatch()
  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <Popover.Button className="group inline-flex items-center rounded-md bg-white text-base text-black font-medium p-1 hover:bg-black hover:text-white hover:cursor-pointer">
            <span>Shapes</span>
            <ChevronDownIcon
              className="ml-2 h-5 w-5"
              aria-hidden="true"
            />
          </Popover.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className={navbarDropdownStyle}>
              <div className={navbarDropdownBoxStyle}>
                <div className={navbarDropdownPadding}>
                  {baseShapes.map((shape) => (
                    <div
                      onClick={() => {
                        dispatch(setModality('NormalSelection'))
                        let newComp = addToTheSceneANew(shape);
                        setOpacityNormalMode(newComp.keyComponent)
                      }}
                      key={shape}
                    >
                      <div className={navbarDropdownItemStyle}>
                        {/* <img
                          src={iconForA(shape)}
                          alt={`Add ${shape}`}
                          className="mr-5 w-[15px]"
                        /> */}
                        {iconForA(shape)}
                        <span className="ml-4 text-base font-medium">
                          {shape}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
};
