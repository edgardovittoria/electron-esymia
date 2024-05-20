import React, {Fragment, useState} from 'react';
import {Dialog, Transition} from "@headlessui/react";

export interface ModalCustomAttributesProps{
    showModalCustomAttributes: boolean,
    setShowModalCustomAttributes: (v: boolean) => void,
    attribute: string,
    customAttribute: CustomMaterialAttribute,
    setCustomAttribute: Function
}

export type CustomMaterialAttribute = {
    frequencies: number[],
    values: {Re: number, Im: number}[]
}

const ModalCustomAttributes: React.FC<ModalCustomAttributesProps> = (
    {
        showModalCustomAttributes, setShowModalCustomAttributes, attribute, customAttribute, setCustomAttribute
    }
) => {

    const [frequency, setFrequency] = useState<number>(0);
    const [valuesRE, setValuesRE] = useState<number>(0);
    const [valuesIm, setValuesIm] = useState<number>(0);


    function onModalClose() {
        setValuesRE(0)
        setValuesIm(0)
        setFrequency(0)
        setShowModalCustomAttributes(false)
    }


    return (
        <Transition appear show={showModalCustomAttributes} as={Fragment}>
            <Dialog as="div" className="relative z-10" onClose={onModalClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-25"/>
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel
                                className="w-full max-w-[1200px] h-[650px] mt-14 bg-white transform overflow-hidden rounded-2xl p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title
                                    as="h3"
                                    className="text-lg font-medium leading-6 text-gray-900"
                                >
                                    DEFINE NEW {attribute.toUpperCase()}
                                </Dialog.Title>
                                <hr className="mt-2 mb-3"/>
                                <div className="flex mb-4">
                                    <h5>Insert frequencies and {attribute} values</h5>
                                </div>
                                <div className="flex">
                                    <div className="w-1/4">
                                        <label className="mb-2">Frequency(float)</label>
                                        <input type="number"
                                               className="rounded border-[1px] border-secondaryColor w-[75%] p-[2px] formControl"
                                               value={frequency}
                                               onChange={(event) => {
                                                   setFrequency(parseFloat(event.currentTarget.value))
                                               }}
                                        />
                                    </div>
                                    <div className="w-3/4">
                                        <label className="mb-2">Values(complex)</label>
                                        <div className="flex">
                                            <div className="w-1/3">
                                                <input type="number"
                                                       className="rounded border-[1px] border-secondaryColor w-[75%] p-[2px] formControl"
                                                       placeholder="Re"
                                                       value={valuesRE}
                                                       onChange={(event) => {
                                                           setValuesRE(parseFloat(event.currentTarget.value))
                                                       }}
                                                />
                                            </div>
                                            <div className="w-1/3">
                                                <input type="number"
                                                       className="rounded border-[1px] border-secondaryColor w-[75%] p-[2px] formControl"
                                                       placeholder="Im"
                                                       value={valuesIm}
                                                       onChange={(event) => {
                                                           setValuesIm(parseFloat(event.currentTarget.value))
                                                       }}
                                                />
                                            </div>
                                            <div className="w-1/3">
                                                <button className="btn w-[59%] h-[2rem] min-h-[2rem] hover:cursor-pointer hover:opacity-70"
                                                        onClick={() => {
                                                            setCustomAttribute({
                                                                frequencies: [...customAttribute.frequencies, frequency],
                                                                values: [...customAttribute.values, {Re: valuesRE, Im: valuesIm}]
                                                            });
                                                            setFrequency(0)
                                                            setValuesRE(0)
                                                            setValuesIm(0)
                                                        }}
                                                >ADD VALUE
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {customAttribute.frequencies.length > 0 &&
                                    <>
                                        <hr className="mt-4"/>
                                        <div className={`flex max-h-[250px] overflow-scroll`}>
                                            <table className="w-1/2 mt-1 ml-3">
                                                <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Frequency</th>
                                                    <th>Values(Re+Im)</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {customAttribute.frequencies.map((value, index) => {
                                                    return (
                                                        <tr key={index}>
                                                            <td>{index}</td>
                                                            <td>{value}</td>
                                                            <td>{customAttribute.values[index].Re} + {customAttribute.values[index].Im}i</td>
                                                            <td><button className='btn w-[59%] h-[2rem] min-h-[2rem] bg-red-500 hover:cursor-pointer hover:opacity-70' onClick={() => {setCustomAttribute({
                                                                frequencies: customAttribute.frequencies.filter((f, ind) => ind !== index),
                                                                values: customAttribute.values.filter((v, ind) => ind !== index)
                                                            })}}>Delete</button></td>
                                                        </tr>
                                                    )
                                                })}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="flex mt-2">
                                            <button className="btn w-full mt-5 h-[2rem] min-h-[2rem] hover:cursor-pointer hover:opacity-70"
                                                    onClick={async () => {
                                                        let newCustomMateriaAttribute: CustomMaterialAttribute = {
                                                            frequencies: customAttribute.frequencies,
                                                            values: customAttribute.values
                                                        }
                                                        let confirm = window.confirm(`Are you sure to save custom ${attribute}?`);
                                                        if(confirm){
                                                            setCustomAttribute(newCustomMateriaAttribute)
                                                            onModalClose()
                                                        }

                                                    }}
                                            >SAVE {attribute.toUpperCase()}
                                            </button>
                                        </div>
                                    </>
                                }
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}

export default ModalCustomAttributes