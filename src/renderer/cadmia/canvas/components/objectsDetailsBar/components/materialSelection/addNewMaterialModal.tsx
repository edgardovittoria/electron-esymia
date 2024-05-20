import {Dialog, Transition} from "@headlessui/react"
import {useFaunaQuery} from "cad-library"
import {FC, Fragment, ReactNode, useEffect, useState} from "react"
import toast from "react-hot-toast"
import {ChromePicker} from "react-color"
import faunadb from "faunadb"
import ModalCustomAttributes, {CustomMaterialAttribute} from "./ModalCustomAttributes";

export const AddNewMaterialModal: FC<{ showModal: Function, updateMaterials: Function }> = ({
                                                                                                showModal,
                                                                                                updateMaterials
                                                                                            }) => {
    const {execQuery} = useFaunaQuery()
    const [name, setName] = useState("")
    const [color, setColor] = useState("#333")
    const [permeability, setPermeability] = useState<number | undefined>(undefined)
    const [tangentDeltaPermeability, setTangentDeltaPermeability] = useState<number | undefined>(undefined)
    const [customPermeability, setCustomPermeability] = useState<CustomMaterialAttribute>({frequencies: [], values: []})
    const [permittivity, setPermittivity] = useState<number | undefined>(undefined)
    const [tangentDeltaPermittivity, setTangentDeltaPermittivity] = useState<number | undefined>(undefined)
    const [customPermittivity, setCustomPermittivity] = useState<CustomMaterialAttribute>({frequencies: [], values: []})
    const [conductivity, setConductivity] = useState<number | undefined>(undefined)
    const [tangentDeltaConductivity, setTangentDeltaConductivity] = useState<number | undefined>(undefined)
    const [customConductivity, setCustomConductivity] = useState<CustomMaterialAttribute>({frequencies: [], values: []})
    const [valueErrorMessage, setValueErrorMessage] = useState<string | undefined>(undefined)
    const [saveMaterialFlag, setSaveMaterialFlag] = useState(false)
    const [showModalCustomPermeability, setShowModalCustomPermeability] = useState(false)
    const [showModalCustomPermittivity, setShowModalCustomPermittivity] = useState(false)
    const [showModalCustomConductivity, setShowModalCustomConductivity] = useState(false)

    type FaunaMaterial = {
        name: string;
        color: string;
        permeability: number;
        tangent_delta_permeability?: number;
        custom_permeability?: CustomMaterialAttribute
        permittivity: number;
        tangent_delta_permittivity?: number;
        custom_permittivity?: CustomMaterialAttribute
        conductivity: number;
        tangent_delta_conductivity?: number;
        custom_conductivity?: CustomMaterialAttribute
    }

    async function saveNewMaterial(faunaClient: faunadb.Client, faunaQuery: typeof faunadb.query, newMaterial: FaunaMaterial) {
        try {
            await faunaClient.query((
                faunaQuery.Create(
                    faunaQuery.Collection('Materials'),
                    {
                        data: {
                            ...newMaterial
                        }
                    }
                )
            ))
            toast.success("Material successfully saved!")
        } catch (e) {
            toast.error("Material not saved! See console log for error details.")
            console.log(e)
        }
    }

    const checkForValueErrors = () => {
        let error = undefined
        if (name === "") {
            error = "You must insert a valid name for the new material."
        } else if (!permeability) {
            error = "You must insert a permeability value."
        } else if (!permittivity) {
            error = "You must insert a permittivity value."
        } else if (!conductivity) {
            error = "You must insert a conductivity value."
        }

        if (error !== undefined) {
            setValueErrorMessage(error)
            setSaveMaterialFlag(false)
        } else {
            setValueErrorMessage(error)
            setSaveMaterialFlag(true)
        }
    }

    const adjustNumberFormatForThis = (stringValue: string) => {
        return !Number.isNaN(parseFloat(stringValue)) ? parseFloat(stringValue) : undefined
    }

    useEffect(() => {
        if (valueErrorMessage) {
            toast.error(valueErrorMessage)
            setValueErrorMessage(undefined)
        }
    }, [valueErrorMessage])

    useEffect(() => {
        if (saveMaterialFlag) {
            setSaveMaterialFlag(false)
            showModal(false)
            execQuery(saveNewMaterial, {
                name: name,
                color: color,
                permeability: permeability,
                tangent_delta_permeability: tangentDeltaPermeability,
                custom_permeability: customPermeability ? customPermeability : undefined,
                permittivity: permittivity,
                tangent_delta_permittivity: tangentDeltaPermittivity,
                custom_permittivity: customPermittivity ? customPermittivity : undefined,
                conductivity: conductivity,
                tangent_delta_conductivity: tangentDeltaConductivity,
                custom_conductivity: customConductivity ? customConductivity : undefined
            } as FaunaMaterial).then(() => updateMaterials())
        }
    }, [saveMaterialFlag])


    return (
        <Transition appear show={true} as={Fragment}>
            <Dialog as="div" className="relative z-10" onClose={() => showModal(false)}>
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
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
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
                                className="w-full max-w-xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title
                                    as="h3"
                                    className="text-lg font-medium leading-6 text-gray-900"
                                >
                                    Add new material to database
                                </Dialog.Title>
                                <hr className="my-4 border-gray-800"/>
                                <MaterialOptionMainStyle label="Name">
                                    <input
                                        type="text"
                                        value={name}
                                        required
                                        onChange={(e) => {
                                            setName(e.target.value)
                                        }}
                                        className="border border-black rounded shadow p-1 w-[60%] text-black text-left text-sm"
                                    />
                                </MaterialOptionMainStyle>
                                <MaterialOptionMainStyle label="Color">
                                    <ChromePicker
                                        color={color}
                                        onChangeComplete={(color) => setColor(color.hex)}
                                        disableAlpha={true}
                                    />
                                </MaterialOptionMainStyle>
                                <MaterialOptionMainStyle label="Permeability">
                                    <input
                                        type="number"
                                        step={0.00001}
                                        value={permeability}
                                        required
                                        onChange={(e) => {
                                            setPermeability(adjustNumberFormatForThis(e.target.value))
                                        }}
                                        className="border border-black rounded shadow p-1 w-[60%] text-black text-left text-sm"
                                    />
                                </MaterialOptionMainStyle>
                                <MaterialOptionMainStyle label="Tangent Delta Permeability">
                                    <input
                                        type="number"
                                        step={0.00001}
                                        value={tangentDeltaPermeability}
                                        onChange={(e) => {
                                            setTangentDeltaPermeability(adjustNumberFormatForThis(e.target.value))
                                        }}
                                        className="border border-black rounded shadow p-1 w-[60%] text-black text-left text-sm"
                                    />
                                </MaterialOptionMainStyle>
                                <MaterialOptionMainStyle label="Custom Permeability">
                                    <button
                                        className="btn w-[59%] h-[2rem] min-h-[2rem] hover:cursor-pointer hover:opacity-70"
                                        onClick={() => setShowModalCustomPermeability(true)}
                                    >
                                        {customPermeability.frequencies.length === 0 ? "SET" : "VIEW"}
                                    </button>
                                </MaterialOptionMainStyle>
                                {showModalCustomPermeability &&
                                    <ModalCustomAttributes showModalCustomAttributes={showModalCustomPermeability}
                                                           setShowModalCustomAttributes={setShowModalCustomPermeability}
                                                           attribute={"Custom Permeability"}
                                                           setCustomAttribute={setCustomPermeability}
                                                           customAttribute={customPermeability}/>
                                }
                                <MaterialOptionMainStyle label="Permittivity">
                                    <input
                                        type="number"
                                        step={0.00001}
                                        value={permittivity}
                                        required
                                        onChange={(e) => {
                                            setPermittivity(adjustNumberFormatForThis(e.target.value))
                                        }}
                                        className="border border-black rounded shadow p-1 w-[60%] text-black text-left text-sm"
                                    />
                                </MaterialOptionMainStyle>
                                <MaterialOptionMainStyle label="Tangent Delta Permittivity">
                                    <input
                                        type="number"
                                        step={0.00001}
                                        value={tangentDeltaPermittivity}
                                        onChange={(e) => {
                                            setTangentDeltaPermittivity(adjustNumberFormatForThis(e.target.value))
                                        }}
                                        className="border border-black rounded shadow p-1 w-[60%] text-black text-left text-sm"
                                    />
                                </MaterialOptionMainStyle>
                                <MaterialOptionMainStyle label="Custom Permeability">
                                    <button
                                        className="btn w-[59%] h-[2rem] min-h-[2rem] hover:cursor-pointer hover:opacity-70"
                                        onClick={() => setShowModalCustomPermittivity(true)}
                                    >
                                        {customPermittivity.frequencies.length === 0 ? "SET" : "VIEW"}
                                    </button>
                                </MaterialOptionMainStyle>
                                {showModalCustomPermittivity &&
                                    <ModalCustomAttributes showModalCustomAttributes={showModalCustomPermittivity}
                                                           setShowModalCustomAttributes={setShowModalCustomPermittivity}
                                                           attribute={"Custom Permittivity"}
                                                           setCustomAttribute={setCustomPermittivity}
                                                           customAttribute={customPermittivity}/>
                                }
                                <MaterialOptionMainStyle label="Conductivity">
                                    <input
                                        type="number"
                                        step={0.00001}
                                        value={conductivity}
                                        required
                                        onChange={(e) => {
                                            setConductivity(adjustNumberFormatForThis(e.target.value))
                                        }}
                                        className="border border-black rounded shadow p-1 w-[60%] text-black text-left text-sm"
                                    />
                                </MaterialOptionMainStyle>
                                <MaterialOptionMainStyle label="Tangent Delta Conductivity">
                                    <input
                                        type="number"
                                        step={0.00001}
                                        value={tangentDeltaConductivity}
                                        onChange={(e) => {
                                            setTangentDeltaConductivity(adjustNumberFormatForThis(e.target.value))
                                        }}
                                        className="border border-black rounded shadow p-1 w-[60%] text-black text-left text-sm"
                                    />
                                </MaterialOptionMainStyle>
                                <MaterialOptionMainStyle label="Custom Permeability">
                                    <button
                                        className="btn w-[59%] h-[2rem] min-h-[2rem] hover:cursor-pointer hover:opacity-70"
                                        onClick={() => setShowModalCustomConductivity(true)}
                                    >
                                        {customConductivity.frequencies.length === 0 ? "SET" : "VIEW"}
                                    </button>
                                </MaterialOptionMainStyle>
                                {showModalCustomConductivity &&
                                    <ModalCustomAttributes showModalCustomAttributes={showModalCustomConductivity}
                                                           setShowModalCustomAttributes={setShowModalCustomConductivity}
                                                           attribute={"Custom Conductivity"}
                                                           setCustomAttribute={setCustomConductivity}
                                                           customAttribute={customConductivity}/>
                                }
                                <hr className="my-4 border-gray-800"/>
                                <div className="mt-4 flex justify-between">
                                    <button
                                        type="button"
                                        className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                        onClick={() => showModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                        onClick={() => checkForValueErrors()}
                                    >
                                        Add
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}

const MaterialOptionMainStyle: FC<{ label: string, children:ReactNode }> = ({label, children}) => {
    return (
        <div className="mt-2">
            <div className="flex items-center justify-between">
                <label className="ml-2 text-sm w-[40%]">{label}:</label>
                {children}
            </div>
        </div>
    )
}