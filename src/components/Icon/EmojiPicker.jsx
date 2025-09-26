import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import Picker from "emoji-picker-react";
import EmojiPicker, { Theme } from "emoji-picker-react";

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

const EmojiPickerWrapper = ( props ) => {
    const {
        children,
        getValue,
        asChild
    } = props;

    // const route = useRouter();
    // const Picker = dynamic( () => import( 'emoji-picker-react' ) );
    const [ showPicker, setShowPicker ] = useState( false );

    const onEmojiClick = ( emoji, event ) => {
        if ( getValue ) getValue( selected.emoji );

        // setInputStr( ( prevInput ) => prevInput + emoji.emoji );
        setShowPicker( false );
    };

    return (
        <div className='flex items-center'>
            <Popover>
                <PopoverTrigger asChild={ asChild } className="cursor-pointer">
                    { children }
                </PopoverTrigger>
                <PopoverContent
                    className="p-0 border-none"
                >
                    <div className="picker-container">
                        <EmojiPicker
                            className=''
                            // emojiStyle={ 'native' }
                            pickerStyle={ { width: "70%" } }
                            onEmojiClick={ ( emoji, event ) => { onEmojiClick( emoji, event ); } }
                            reactionsDefaultOpen={ true }
                            lazyLoadEmojis={ true }
                            autoFocusSearch={ true }
                            width={ `20rem` }
                            height={ `20rem` }
                        />
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
};

export default EmojiPickerWrapper;
