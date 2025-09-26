// https://21st.dev/builduilabs/filesystem-item/default //

import { useState } from "react";
import { ChevronRight, Folder, File } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const nodes = [
    {
        name: 'Home',
        nodes: [
            {
                name: 'Movies',
                nodes: [
                    {
                        name: 'Action',
                        nodes: [
                            {
                                name: '2000s',
                                nodes: [
                                    { name: 'Gladiator.mp4' },
                                    { name: 'The-Dark-Knight.mp4' },
                                ],
                            },
                            { name: '2010s', nodes: [] },
                        ],
                    },
                    {
                        name: 'Comedy',
                        nodes: [ { name: '2000s', nodes: [ { name: 'Superbad.mp4' } ] } ],
                    },
                    {
                        name: 'Drama',
                        nodes: [
                            { name: '2000s', nodes: [ { name: 'American-Beauty.mp4' } ] },
                        ],
                    },
                ],
            },
            {
                name: 'Music',
                nodes: [
                    { name: 'Rock', nodes: [] },
                    { name: 'Classical', nodes: [] },
                ],
            },
            { name: 'Pictures', nodes: [] },
            {
                name: 'Documents',
                nodes: [],
            },
            { name: 'passwords.txt' },
        ],
    },
];

export function FilesystemItem ( {
    node,
    animated = false,
} ) {
    let [ isOpen, setIsOpen ] = useState( false );

    // Общий контент для обоих вариантов
    const ChevronIcon = () =>
        animated ? (
            <motion.span
                animate={ { rotate: isOpen ? 90 : 0 } }
                transition={ { type: "spring", bounce: 0, duration: 0.4 } }
                className="flex"
            >
                <ChevronRight className="size-4 text-gray-500" />
            </motion.span>
        ) : (
            <ChevronRight
                className={ `size-4 text-gray-500 ${ isOpen ? "rotate-90" : "" }` }
            />
        );

    const ChildrenList = () => {
        const children = node.nodes?.map( ( node ) => (
            <FilesystemItem node={ node } key={ node.name } animated={ animated } />
        ) );

        if ( animated ) {
            return (
                <AnimatePresence>
                    { isOpen && (
                        <motion.ul
                            initial={ { height: 0 } }
                            animate={ { height: "auto" } }
                            exit={ { height: 0 } }
                            transition={ { type: "spring", bounce: 0, duration: 0.4 } }
                            className="pl-6 overflow-hidden flex flex-col justify-end"
                        >
                            { children }
                        </motion.ul>
                    ) }
                </AnimatePresence>
            );
        }

        return isOpen && <ul className="pl-6">{ children }</ul>;
    };

    return (
        <li key={ node.name }>
            <span className="flex items-center gap-1.5 py-1">
                { node.nodes && node.nodes.length > 0 && (
                    <button onClick={ () => setIsOpen( !isOpen ) } className="p-1 -m-1">
                        <ChevronIcon />
                    </button>
                ) }

                { node.nodes ? (
                    <Folder
                        className={ `size-6 text-sky-500 fill-sky-500 ${ node.nodes.length === 0 ? "ml-[22px]" : ""
                            }` }
                    />
                ) : (
                    <File className="ml-[22px] size-6 text-gray-900" />
                ) }
                { node.name }
            </span>

            <ChildrenList />
        </li>
    );
}


// import { FilesystemItem } from "@/components/ui/filesystem-item";

function FilesystemItemAnimatedDemo () {
    return (
        <div className="p-4 h-[600px] w-[400px] overflow-y-auto">
            <ul>
                { nodes.map( ( node ) => (
                    <FilesystemItem node={ node } key={ node.name } animated />
                ) ) }
            </ul>
        </div>
    );
}

function FilesystemItemDemo () {
    return (
        <div className="p-4 h-[600px] w-[400px] overflow-y-auto">
            <ul>
                { nodes.map( ( node ) => (
                    <FilesystemItem node={ node } key={ node.name } />
                ) ) }
            </ul>
        </div>
    );
}

export { FilesystemItemAnimatedDemo, FilesystemItemDemo };
