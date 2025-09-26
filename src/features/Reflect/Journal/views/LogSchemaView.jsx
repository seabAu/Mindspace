import React from 'react';
import Droplist from '@/components/Droplist';
import DropTable from '@/components/Droplist/droptable';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import useGlobalStore from '@/store/global.store';
import { ArrowBigLeft, ArrowBigRight } from 'lucide-react';
import * as utils from 'akashatools';
import FormGenerator from '@/components/Form/FormGenerator';
import { formatDate, formatDateTime } from '@/lib/utilities/time';
import { DateTimeLocal, Decimal, ObjectArray, ObjectId } from '@/lib/config/types';

const LogSchemaView = ( { logSchema, schemas, } ) => {
    return (

        <div
            className={ `w-full h-full border border-dashed border-brand-washedBlue-200` }>
            <h1
                className={ `text-2xl font-bold w-auto h-full justify-center items-center text-center align-middle` }
            >
                { `Schema Detail View` }
            </h1>

            <div
                className={ `flex flex-col w-full h-full max-w-full overflow-hidden items-center justify-center flex-wrap flex-grow rounded-2xl whitespace-pre-wrap break-words overflow-ellipsis` }
            >
                { logSchema && utils.val.isObject( logSchema ) && schemas && (
                    <ul className={ `properties-list flex flex-grow flex-col flex-nowrap justify-center items-stretch w-full h-full px-2 py-2 ` }>
                        <DropTable
                            label="Event Details"
                            data={ logSchema }
                            showControls={ true }
                            expandable={ true }
                            compact={ false }
                            collapse={ false }
                            useBackgroundOverlay={ true }
                        />

                        <Droplist
                            label={ 'Properties' }
                            data={ schemas }
                            layout={ "default" }
                            display={ "block" }
                            flexDirection={ "column" }
                            fillArea={ true }
                            height={ "auto" }
                            width={ "auto" }
                            showControls={ true }
                            expandable={ true }
                            compact={ true }
                            collapse={ false }
                            classes={ "" }
                            styles={ {} }
                            debug={ false }
                        />
                    </ul>
                ) }
            </div>
        </div>
    );
};

export default LogSchemaView;
