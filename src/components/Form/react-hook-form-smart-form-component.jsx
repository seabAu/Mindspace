import { useForm } from "react-hook-form";
import React from "react";
import ReactDOM from "react-dom";
import { Form, Input, Select } from "./components";
import "./styles.css";

export function App () {
    const onSubmit = data => console.log( data );

    return (
        <>
            <h1>Smart Form Component</h1>
            <Form onSubmit={ onSubmit }>
                <Input name="firstName" />
                <Input name="lastName" />
                <Select name="sex" options={ [ "female", "male" ] } />

                <Input type="submit" value="Submit" />
            </Form>
        </>
    );
}

export function Form ( { defaultValues, children, onSubmit } ) {
    const methods = useForm( { defaultValues } );
    const { handleSubmit } = methods;

    return (
        <form onSubmit={ handleSubmit( onSubmit ) }>
            { React.Children.map( children, child => {
                return child.props.name
                    ? React.createElement( child.type, {
                        ...{
                            ...child.props,
                            register: methods.register,
                            key: child.props.name
                        }
                    } )
                    : child;
            } ) }
        </form>
    );
}

export function Input ( { register, name, ...rest } ) {
    return <input name={ name } ref={ register } { ...rest } />;
}
import React from "react";
import { useForm } from "react-hook-form";

export function Form ( { defaultValues, children, onSubmit } ) {
    const methods = useForm( { defaultValues } );
    const { handleSubmit } = methods;

    return (
        <form onSubmit={ handleSubmit( onSubmit ) }>
            { React.Children.map( children, child => {
                return child.props.name
                    ? React.createElement( child.type, {
                        ...{
                            ...child.props,
                            register: methods.register,
                            key: child.props.name
                        }
                    } )
                    : child;
            } ) }
        </form>
    );
}

export function Input ( { register, name, ...rest } ) {
    return <input name={ name } ref={ register } { ...rest } />;
}

export function Select ( { register, options, name, ...rest } ) {
    return (
        <select name={ name } ref={ register } { ...rest }>
            { options.map( value => (
                <option key={ value } value={ value }>
                    { value }
                </option>
            ) ) }
        </select>
    );
}

export function Select ( { register, options, name, ...rest } ) {
    return (
        <select name={ name } ref={ register } { ...rest }>
            { options.map( value => (
                <option key={ value } value={ value }>
                    { value }
                </option>
            ) ) }
        </select>
    );
}
