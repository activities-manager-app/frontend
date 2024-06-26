"use client";

import { FC, useCallback, useEffect, useRef, useState } from "react";

import { useParams } from "next/navigation";
import { useDataContext } from "@/app/(dashboard)/context";
import { Button, Loading } from "@/components";
import { useTheme } from "@/context";

import {
    LinkObjectComponent,
    AddLinkForm,
    CodeObjectComponent,
    QuillObjectComponent,
    SandboxObjectComponent,
    AddImageForm,
    ImageObjectComponent
} from "./Objects";

import { Activity, ObjectType, ObjectsOrdering } from "@/types";
import { dataStore } from "../actions";
import { useSession } from "@/app/auth/context";
import Icon from "@/icons";
import { Modal } from "@/components/modals";


export default function ActivityComponent() {

    const { mode } = useTheme();
    const { activity } = useActivity();
    const { objects, moveUp, moveDown, objectsOrdering } = useObjects();
    const { buildObjectsOrderings, activityObjectsOrderings } = useDataContext();
    const [showOptionsFor, setShowOptionsFor] = useState<{ id: string }>();

    if (!activity) {
        return (
            <div className="activity">
                <Loading />
            </div>
        );
    }

    return (
        <div className="activity">
            <div className="activity__board__wrapper">
                <div className={`activity__board activity__board--${mode}`}>
                    <ul className={`activity__board__objects-list activity__board__objects-list--${mode}`}>
                        {/* <button onClick={() => buildObjectsOrderings()}>Build ordering</button> */}
                        {/* <>
                        <button onClick={() => console.log("OBJECTS: ", objects)}>Log objects</button>
                        <button onClick={() => console.log("ORDERINGS: ", objectsOrdering)}>Log orderings</button>
                    </> */}
                        <div className="activity__board__objects-list__counter">
                            Count: {objects.length}
                        </div>
                        {objects.length === 0 &&
                            <ControlPanel activity={activity} obj={null} setShow={setShowOptionsFor} />
                        }
                        {objects
                            .map(obj => {
                                return (
                                    <li key={obj.key} className={`
                                        activity__board__objects-list__item 
                                        activity__board__objects-list__item--${mode}`}>
                                        <hr />
                                        <div className="activity__board__objects-list__item__header">
                                            <div className="activity__board__objects-list__item__header__heading">
                                                {obj.position + ") " + obj.key} {new Date(obj.created_at).toLocaleDateString()}
                                            </div>
                                            <div className="activity__board__objects-list__item__header__buttons">
                                                {obj.position > 1 &&
                                                    <Button onClick={() => moveUp(obj)}>
                                                        Move up <Icon icon="arrow-up" />
                                                    </Button>
                                                }
                                                {obj.position < objects.length &&
                                                    <Button onClick={() => moveDown(obj)}>
                                                        Move down <Icon icon="arrow-down" />
                                                    </Button>
                                                }
                                            </div>
                                        </div>
                                        <div className={`activity__object activity__object--${obj.type}`}>
                                            <ObjectTypeSelector obj={obj} />
                                        </div>
                                        {showOptionsFor && showOptionsFor.id === obj.key ?
                                            <ControlPanel activity={activity} obj={obj} setShow={setShowOptionsFor} /> :
                                            <Button
                                                className="activity__control-panel-wrapper__button activity__control-panel-wrapper__button--plus"
                                                onClick={() => setShowOptionsFor({ id: obj.key })}>
                                                <Icon icon="plus" />
                                            </Button>
                                        }
                                    </li>
                                );
                            })
                        }
                    </ul>
                </div>
                <div className="activity__board__aside">
                    <div>Aside content</div>
                    {/* {objects.map(obj => {
                        return (
                            <li key={obj.key}>
                                { obj.position } - { obj.type }
                            </li>
                        )
                    })} */}
                </div>
            </div>
        </div>
    );
}

type ObjectTypeSelectorProps = { obj: ObjectType }
const ObjectTypeSelector: FC<ObjectTypeSelectorProps> = ({ obj }: ObjectTypeSelectorProps) => {
    switch (obj.type) {
        case "code":
            return <CodeObjectComponent obj={obj} />;
        case "image":
            return <ImageObjectComponent obj={obj} />;
        case "latex":
            return <div>LaTex Component Here</div>;
        case "link":
            return <LinkObjectComponent obj={obj} />;
        case "quill":
            return <QuillObjectComponent obj={obj} />;
        case "text":
            return <div>Text Component Here</div>;
        case "codesandbox":
            return <SandboxObjectComponent obj={obj} />;
        default:
            return <div>Error! Obejct Type unknown.</div>;
    }
};
ObjectTypeSelector.displayName = "ObjectTypeSelector";


const ControlPanel = ({
    activity,
    obj,
    setShow
}: {
    activity: Activity,
    obj: ObjectType | null,
    setShow: React.Dispatch<React.SetStateAction<{ id: string } | undefined>>
}) => {

    const { mode } = useTheme();
    const { addObject } = useDataContext();
    const [showLinkForm, setShowLinkForm] = useState<boolean>(false);
    const [showImageForm, setShowImageForm] = useState<boolean>(false);
    const [position, setPosition] = useState<number>(0);
    const controlsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setPosition(obj && obj.position ? obj.position : 0);
    }, [obj]);


    const scrollLeft = useCallback(() => {
        const ref = controlsRef.current;
        if (ref) {
            ref.scrollBy({ behavior: "smooth", left: -250, top: 0 });
        }
    }, []);

    const scrollRight = useCallback(() => {
        const ref = controlsRef.current;
        if (ref) {
            ref.scrollBy({ behavior: "smooth", left: 250, top: 0 });
        }
    }, []);

    useEffect(() => {
        const ref = controlsRef.current;

        const onResize = () => {
            console.log("resize");
        };

        document.addEventListener("resize", onResize);

        return () => {
            document.removeEventListener("resize", onResize);
        }
    }, []);

    const [showSandboxOptions, setShowSandboxOptions] = useState<boolean>(false);

    return (
        <div className={`activity__control-panel activity__control-panel--${mode}`}>
            <div className="activity__controls-wrapper">
                <Button
                    className="activity__control-panel-wrapper__button activity__control-panel-wrapper__button--x"
                    onClick={() => setShow(undefined)}
                >
                    <Icon icon="x" />
                </Button>
                {controlsRef.current && controlsRef.current.getBoundingClientRect().width < controlsRef.current.scrollWidth &&
                    <Button className="activity__control-panel__scroll-button activity__control-panel__scroll-button--left"
                        onClick={scrollLeft}>
                        <Icon icon="caret-left" />
                    </Button>
                }
                <div ref={controlsRef} className={`activity__control-panel__scroll-wrapper activity__control-panel__scroll-wrapper--${mode}`}>
                    <div className="activity__control-panel__buttons">
                        <Button
                            baseClassName="activity__control-panel__button"
                            buttonName="add-object"
                            themeMode={mode}
                            onClick={() => {
                                setShowLinkForm(true);
                            }}>
                            <Icon icon="link-plus" className="activity__control-panel__button__icon" /> Link
                        </Button>

                        <Button
                            baseClassName="activity__control-panel__button"
                            buttonName="add-object"
                            themeMode={mode}
                            onClick={() => {
                                setShowImageForm(true);
                            }}>
                            <Icon icon="photo-plus" className="activity__control-panel__button__icon" /> Image
                        </Button>

                        <Button
                            baseClassName="activity__control-panel__button"
                            buttonName="add-object"
                            themeMode={mode}
                            onClick={() => {
                                addObject({
                                    userId: activity.userId,
                                    activityId: activity.key,
                                    type: "quill",
                                    quillData: { delta: undefined, html: "" },
                                    position
                                });
                            }}>
                            <Icon icon="text" className="activity__control-panel__button__icon" /> Text Editor
                        </Button>

                        <Button
                            baseClassName="activity__control-panel__button"
                            buttonName="add-object"
                            themeMode={mode}
                            onClick={() => {
                                addObject({
                                    userId: activity.userId,
                                    activityId: activity.key,
                                    type: "code",
                                    codeData: { code: "", language: "" },
                                    position
                                });
                            }}>
                            <Icon icon="code" className="activity__control-panel__button__icon" /> Code Editor
                        </Button>

                        <div className="activity__control-panel__code-sandbox-options-wrapper">
                            <Button
                                baseClassName="activity__control-panel__button"
                                buttonName="add-object"
                                themeMode={mode}
                                onClick={() => { setShowSandboxOptions(true) }}>
                                <Icon icon="codeSandbox" className="activity__control-panel__button__icon" /> Code Sandbox
                            </Button>

                            {showSandboxOptions &&
                                <Modal setShow={setShowSandboxOptions} className="activity__control-panel__code-sandbox-options-modal">
                                    <div className="activity__control-panel__code-sandbox-options">
                                        <div className="activity__control-panel__code-sandbox-options__option">
                                            <p className="activity__control-panel__code-sandbox-options__option__text">
                                                Add a sandbox template for HTML and CSS.
                                            </p>
                                            <Button
                                                baseClassName="activity__control-panel__button"
                                                className="activity__control-panel__code-sandbox-options__option__button" buttonName="add-object"
                                                themeMode={mode}
                                                onClick={() => {
                                                    addObject({
                                                        userId: activity.userId,
                                                        activityId: activity.key,
                                                        type: "codesandbox",
                                                        codeSandboxData: { sandboxId: "", template: "html-css" },
                                                        position
                                                    });
                                                }}>
                                                <Icon icon="codeSandbox" className="activity__control-panel__button__icon" /> HTML / CSS
                                            </Button>
                                        </div>
                                        <div className="activity__control-panel__code-sandbox-options__option">
                                            <p className="activity__control-panel__code-sandbox-options__option__text">
                                                Add a sandbox template for vanilla Javascript programming.
                                            </p>
                                            <Button
                                                baseClassName="activity__control-panel__button"
                                                className="activity__control-panel__code-sandbox-options__option__button" buttonName="add-object"
                                                themeMode={mode}
                                                onClick={() => {
                                                    addObject({
                                                        userId: activity.userId,
                                                        activityId: activity.key,
                                                        type: "codesandbox",
                                                        codeSandboxData: { sandboxId: "", template: "javascript" },
                                                        position
                                                    });
                                                }}>
                                                <Icon icon="codeSandbox" className="activity__control-panel__button__icon" /> Javascript
                                            </Button>
                                        </div>
                                        <div className="activity__control-panel__code-sandbox-options__option">
                                            <p className="activity__control-panel__code-sandbox-options__option__text">
                                                Add a sandbox template for a React project.
                                            </p>
                                            <Button
                                                baseClassName="activity__control-panel__button"
                                                className="activity__control-panel__code-sandbox-options__option__button" buttonName="add-object"
                                                themeMode={mode}
                                                onClick={() => {
                                                    addObject({
                                                        userId: activity.userId,
                                                        activityId: activity.key,
                                                        type: "codesandbox",
                                                        codeSandboxData: { sandboxId: "", template: "react" },
                                                        position
                                                    });
                                                }}>
                                                <Icon icon="codeSandbox" className="activity__control-panel__button__icon" /> React
                                            </Button>
                                        </div>
                                        <div className="activity__control-panel__code-sandbox-options__option">
                                            <p className="activity__control-panel__code-sandbox-options__option__text">
                                                Add a sandbox template for a React + Typescript project.
                                            </p>
                                            <Button
                                                baseClassName="activity__control-panel__button"
                                                className="activity__control-panel__code-sandbox-options__option__button"
                                                buttonName="add-object"
                                                themeMode={mode}
                                                onClick={() => {
                                                    addObject({
                                                        userId: activity.userId,
                                                        activityId: activity.key,
                                                        type: "codesandbox",
                                                        codeSandboxData: { sandboxId: "", template: "react-typescript" },
                                                        position
                                                    });
                                                }}>
                                                <Icon icon="codeSandbox" className="activity__control-panel__button__icon" /> React + Typescript
                                            </Button>
                                        </div>

                                    </div>
                                </Modal>
                            }
                        </div>
                    </div>
                </div>
                {controlsRef.current && controlsRef.current.getBoundingClientRect().width < controlsRef.current.scrollWidth &&
                    <Button className="activity__control-panel__scroll-button activity__control-panel__scroll-button--right"
                        onClick={scrollRight}>
                        <Icon icon="caret-right" />
                    </Button>
                }
            </div>
            <div className="activity__forms-wrapper">
                <AddLinkForm
                    activityId={activity.key}
                    show={showLinkForm}
                    setShow={setShowLinkForm}
                    position={position}
                />
                <AddImageForm
                    activityId={activity.key}
                    show={showImageForm}
                    setShow={setShowImageForm}
                    position={position}
                />
            </div>
        </div>

    );
};

const useActivity = () => {
    const params = useParams();
    const { activities } = useDataContext();

    return {
        activity: activities.filter(activity => activity.key === params.id)[0],
    };
};

const useObjects = () => {
    const { session } = useSession();

    const {
        activityObjectsOrderings,
        setActivityObjectsOrderings,
        activityObjectsList,
        updateObjectsOrdering,
    } = useDataContext();

    const { activity } = useActivity();

    const [objects, setObjects] = useState<ObjectType[]>([]);
    const [objectsOrdering, setObjectsOrdering] = useState<ObjectsOrdering>([]);

    useEffect(() => {
        if (activity) {
            if (activityObjectsOrderings.length > 0) {
                setObjectsOrdering(activityObjectsOrderings
                    .filter(entry => {
                        return entry.activityId === activity.key;
                    })[0].ordering);

                setObjects(activityObjectsList
                    .filter(obj => {
                        return obj.activityId === activity.key;
                    })
                    .sort((a, b) => {
                        return a.position - b.position;
                    }));
            }
            //else {
            //    setObjects(activityObjectsList
            //        .filter(obj => {
            //            return obj.activityId === activity.key;
            //        })
            //        .sort((a, b) => {
            //            return a.created_at - b.created_at;
            //        })
            //    );
            //}
            else {
                setObjects([])
            }
        }
    }, [activity, activityObjectsOrderings, activityObjectsList, setObjectsOrdering, setObjects]);

    //    useEffect(() => {
    //        let objects = activityObjectsList
    //            .filter(obj => {
    //                return obj.activityId === activity.key;
    //            })
    //
    //        //if (objectsOrdering.length > 0) {
    //        objects = objects
    //            .map(obj => {
    //                console.log(obj);
    //                return {
    //                    ...obj,
    //                    position: objectsOrdering.filter(
    //                        item => item.objectId === obj.key
    //                    )[0].position,
    //                }
    //            })
    //            .sort((a, b) => { return a.position - b.position });
    //        //}
    //        //else {
    //        //    console.log("waiting for objects....");
    //        //    objects = []  /* Temporary solution to prevent the list shift from ordered */
    //        //}
    //
    //        console.log("OBJECTS: ", objects);
    //
    //        setObjects(objects);
    //    }, [activityObjectsList, objectsOrdering]);

    /* Utility function for testing*/
    const saveCurrentOrdering = useCallback(() => {
        if (activity) {
            if (session && session.userId) {
                const userId = session.userId;
                if (activity.key) {
                    const activityId = activity.key;
                    dataStore.addObjectsOrdering({ activityId, objectsOrdering, userId });
                }
            }
        }
    }, [activity, session, objectsOrdering]);

    const swap = useCallback((id_1: string, id_2: string) => {
        if (activity) {
            let currentOrdering: ObjectsOrdering = objectsOrdering;
            let temp1 = currentOrdering.filter(entry => entry.objectId === id_1)[0];
            let temp2 = currentOrdering.filter(entry => entry.objectId === id_2)[0];

            currentOrdering = currentOrdering.map(entry => {
                if (entry.objectId === id_1) {
                    return { ...entry, position: temp2.position };
                }
                if (entry.objectId === id_2) {
                    return { ...entry, position: temp1.position };
                }
                return entry;
            });

            const updatedObjectsOrdering = activityObjectsOrderings.map(entry => {
                if (entry.activityId === activity.key) {
                    return { ...entry, ordering: currentOrdering };
                }
                return entry;
            });

            setActivityObjectsOrderings(updatedObjectsOrdering);
            updateObjectsOrdering({ activityId: activity.key, update: currentOrdering });
        }
    }, [activityObjectsOrderings, setActivityObjectsOrderings, updateObjectsOrdering, objectsOrdering, activity]);

    const moveUp = useCallback((obj: ObjectType) => {
        let currentOrder = obj.position;
        let id = obj.key;

        if (currentOrder && currentOrder > 1) {
            let previousId = objectsOrdering.filter(
                (orderItem) => orderItem.position === currentOrder - 1
            )[0].objectId;

            swap(id, previousId);
        }
    }, [objectsOrdering, swap]);

    const moveDown = useCallback((obj: ObjectType) => {
        let currentOrder = obj.position;
        let id = obj.key;

        if (currentOrder && currentOrder < objectsOrdering.length) {
            let previousId = objectsOrdering.filter(
                (orderItem) => orderItem.position === currentOrder + 1
            )[0].objectId;

            swap(id, previousId);
        }
    }, [objectsOrdering, swap]);

    /*     const addObjectBelow = useCallback(({
            currentObj,
            newObject
        }: {
            currentObj: ObjectType | null,
            newObject: NewObject
        }) => {
            if (activity) {
                if (currentObj && currentObj.position) {
                    console.log("Current position: ", currentObj.position);
                    console.log("Orderings: ", objectsOrdering);
    
                    const pos = currentObj.position;
                    let newOrdering = objectsOrdering.map((entry) => {
                        if (entry.position > pos) {
                            return { ...entry, position: entry.position + 1 };
                        }
                        return entry;
                    });
    
    
                    addObject({ ...newObject, position: pos + 1 })
                        .then(createdObj => {
                            if (createdObj && createdObj.key) {
                                const objectId = createdObj.key;
                                const update = [...newOrdering, { objectId, position: pos + 1 }];
                                console.log("New ordering: ", update);
                                updateObjectsOrdering({
                                    activityId: activity.key,
                                    update,
                                });
                                setObjects([...objects, createdObj]);
                                setObjectsOrdering(update);
                            } else {
                                console.log("No key returned to create new ordering entry.");
                            }
                        })
                        .catch(err => console.log("An error ocurred while adding object below.", err));
    
                } else {
                    if (activity.key && (session && session.userId)) {
                        const activityId = activity.key;
                        const userId = session.userId;
                        addObject(newObject)
                            .then(createdObj => {
                                if (createdObj && createdObj.key) {
                                    const objectId = createdObj.key;
                                    addObjectsOrdering({ activityId, objectsOrdering: [{ objectId, position: 1 }], userId });
                                }
                            })
                    }
                }
            }
        }, [objects, objectsOrdering, setObjectsOrdering, addObject, updateObjectsOrdering, activity, session]); */

    return { objects, objectsOrdering, moveUp, moveDown, saveCurrentOrdering };
};
