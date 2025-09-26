/*
 * Custom "star" icon for the toolbar using an Octicon
 * https://octicons.github.io
 */
const CustomButton = () => <span className="octicon octicon-star" />;

/*
 * Event handler to be attached using Quill toolbar module
 * http://quilljs.com/docs/modules/toolbar/
 */
function insertStar () {
    const cursorPosition = this.quill.getSelection().index;
    this.quill.insertText( cursorPosition, '★' );
    this.quill.setSelection( cursorPosition + 1 );
}

/*
 * Custom toolbar component including insertStar button and dropdowns
 */
const CustomToolbar = () => (
    <div id="toolbar">
        <select
            className="ql-header"
            defaultValue={ '' }
            onChange={ ( e ) => e.persist() }
        >
            <option value="1"></option>
            <option value="2"></option>
            <option selected></option>
        </select>
        <button className="ql-bold"></button>
        <button className="ql-italic"></button>
        <select className="ql-color">
            <option value="red"></option>
            <option value="green"></option>
            <option value="blue"></option>
            <option value="orange"></option>
            <option value="violet"></option>
            <option value="#d0d1d2"></option>
            <option selected></option>
        </select>
        <button className="ql-insertStar">
            <CustomButton />
        </button>
    </div>
);

/*
 * Editor component with custom toolbar and content containers
 */
class Editor extends React.Component {
    constructor ( props ) {
        super( props );
        this.state = { editorHtml: '' };
        this.handleChange = this.handleChange.bind( this );
    }

    handleChange ( html ) {
        this.setState( { editorHtml: html } );
    }

    render () {
        return (
            <div className="text-editor">
                <CustomToolbar />
                <ReactQuill
                    onChange={ this.handleChange }
                    placeholder={ this.props.placeholder }
                    modules={ Editor.modules }
                />
            </div>
        );
    }
}

/*
 * Quill modules to attach to editor
 * See http://quilljs.com/docs/modules/ for complete options
 */
Editor.modules = {
    toolbar: {
        container: '#toolbar',
        handlers: {
            insertStar: insertStar,
        },
    },
};

/*
 * Quill editor formats
 * See http://quilljs.com/docs/formats/
 */
Editor.formats = [
    'header',
    'font',
    'size',
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'list',
    'bullet',
    'indent',
    'link',
    'image',
    'color',
];

/*
 * PropType validation
 */
Editor.propTypes = {
    placeholder: React.PropTypes.string,
};

/*
 * Render component on page
 */
ReactDOM.render(
    <Editor placeholder={ 'Write something or insert a star ★' } />,
    document.querySelector( '.app' )
);