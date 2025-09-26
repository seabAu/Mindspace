import React from 'react'

const Uploader = () => {
  return (
    <div>
      
    </div>
  )
}

export default Uploader



/*  // https://codepen.io/glapadre/pen/rNzVeQm // 
    const ANIMATION_DURATION = 400;

    class FileUpload extends React.Component {
      
        constructor() {
            super();

            this.state = {};
            this.handleDragOver = this.handleDragOver.bind(this);
            this.handleDrop = this.handleDrop.bind(this);
            this.handleDragLeave = this.handleDragLeave.bind(this);
            this.handleClick = this.handleClick.bind(this);
        }

        handleDragOver(e) {
            e.preventDefault();
            if (this.state.inDropZone){
                return;
            }
            this.setState({inDropZone: true});
        }
      
        handleDrop(e) {
            e.preventDefault();
            const { dataTransfer } = e;
            const files = [];
            if (dataTransfer.items) {
                for (let i = this.props.single ? dataTransfer.items.length - 1 : 0; i < dataTransfer.items.length; i ++) {
                    if (dataTransfer.items[i].kind == "file") {
                        let file = dataTransfer.items[i].getAsFile();
                        files.push(file);
                    }
                }
            } else {
                for (let i = this.props.single ? dataTransfer.files.length - 1 : 0; i < dataTransfer.files.length; i ++) {
                    files.push(dataTransfer.files[i]);
                }
            }
            this.setState({
                uploading: true
            });
            setTimeout(() => {
                this.setState({
                    uploading: false,
                    inDropZone: false,
                });
                this.props.receiveFiles(files, this.props.id);
            }, ANIMATION_DURATION);
        }
      
        handleDragLeave() {
            if (!this.state.inDropZone)
                return;
            this.setState({inDropZone: false});
        }
      
        handleClick() {
            this.refs.fileInput.click();
        }
      
        handleFilesFromInput(e) {
            let files = [];
            Array.from(e.currentTarget.files).forEach(file => {
                files.push(file);
            });
            this.setState({
                uploading: true
            });
            setTimeout(() => {
                this.setState({
                    uploading: false,
                    inDropZone: false,
                });
                this.props.receiveFiles(files, this.props.id);
            }, ANIMATION_DURATION);
        }
      
        render() {
            let classes = classNames(`drop-it-upload batch ${this.props.className || ''}`, {
                'active': this.state.inDropZone,
                'uploading': this.state.uploading
            });

            const dropEvents = {
                onDrop: this.handleDrop,
                onDragOver: this.handleDragOver,
                onDragLeave: this.handleDragLeave,
                onClick: this.handleClick
            };

            let err;

            if(this.state.error){
                err = (
                    <div className="notification danger">
                        {this.state.error}
                    </div>
                );
            }

            const fileInputAttrs = {
                ref: 'fileInput',
                type: 'file',
                onChange: this.handleFilesFromInput.bind(this),
                style: { position: 'absolute', left: -99999999 },
            };

            if (!this.props.single) {
                fileInputAttrs.multiple = true;
            }

            return (
              <div style={{height: '100%'}}>
                {err}
                <div className={classes} {...dropEvents}>
                  <div className="loader">
                    <i className="fas fa-spinner fa-pulse spinner-style"></i>
                  </div>
                  <input {...fileInputAttrs} />
                  <i className="default fa fa-cloud-upload fa-style" aria-hidden="true"></i>
                  <div className="default">
                    {this.props.copy || 'DRAG FILE HERE OR '} <span class="bold">BROWSE</span>
                  </div>            
                </div>
              </div>        
            );
        }
    }

    function cb(files){
      // SVG's for file types
      const psd = `<svg class="icon file-icon file-icon--psd" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19.607 24">
      <path class="file-icon__shadow" d="M19.592 7.219v-.004c0-.014-.006-.026-.008-.039-.004-.03-.006-.06-.018-.089a.318.318 0 0 0-.055-.085c-.006-.008-.009-.017-.016-.025l-.002-.003-.003-.003-5.451-5.599-.001-.001a.338.338 0 0 0-.238-.102h-.001l-.005-.001H2.947a1.71 1.71 0 0 0-1.708 1.708v19.331a1.71 1.71 0 0 0 1.708 1.708h14.937a1.71 1.71 0 0 0 1.708-1.707V7.221v-.002z"/>
      <path class="file-icon__outline" d="M18.354 5.951v-.004c0-.014-.006-.026-.008-.039-.004-.03-.006-.06-.018-.089a.318.318 0 0 0-.055-.085c-.006-.008-.009-.017-.016-.025l-.002-.003-.003-.003L12.801.104 12.8.103a.338.338 0 0 0-.238-.102h-.001L12.556 0H1.708A1.71 1.71 0 0 0 0 1.708v19.331a1.71 1.71 0 0 0 1.708 1.708h14.937a1.71 1.71 0 0 0 1.708-1.707V5.953l.001-.002zm-5.457-4.768l4.305 4.422h-4.305V1.183zm3.749 20.881H1.708c-.565 0-1.025-.46-1.025-1.025V1.708c0-.565.46-1.025 1.025-1.025h10.506v5.264c0 .189.153.342.342.342h5.115v14.75a1.027 1.027 0 0 1-1.025 1.025z"/>
      <path class="file-icon__outline" d="M5.968 15.424h-.991v1.031h-.661v-3.504c.551 0 1.101-.005 1.652-.005 1.711 0 1.717 2.478 0 2.478zm-.991-.606h.991c.846 0 .841-1.241 0-1.241h-.991v1.241z"/>
      <path class="file-icon__outline" d="M9.908 13.798c-.12-.2-.45-.391-.831-.391-.491 0-.726.205-.726.466 0 .305.36.39.781.439.73.091 1.411.281 1.411 1.116 0 .781-.69 1.116-1.472 1.116-.715 0-1.266-.22-1.526-.86l.551-.285c.155.385.561.556.986.556.416 0 .806-.146.806-.526 0-.33-.345-.465-.811-.515-.716-.086-1.376-.275-1.376-1.062 0-.721.711-1.016 1.356-1.021.545 0 1.111.154 1.376.695l-.525.272zM14.185 14.674c.015.886-.525 1.781-1.752 1.781h-1.376v-3.504h1.376c1.201 0 1.736.857 1.752 1.723zm-2.473 1.145h.721c.796 0 1.111-.58 1.096-1.151-.015-.545-.335-1.091-1.096-1.091h-.721v2.242z"/>
    </svg>`;
       const ai = `<svg class="icon file-icon file-icon--ai" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19.607 24">
      <path class="file-icon__shadow" d="M19.592 7.219v-.004c0-.014-.006-.026-.008-.039-.004-.03-.006-.06-.018-.089a.318.318 0 0 0-.055-.085c-.006-.008-.009-.017-.016-.025l-.002-.003-.003-.003-5.451-5.599-.001-.001a.338.338 0 0 0-.238-.102h-.001l-.005-.001H2.947a1.71 1.71 0 0 0-1.708 1.708v19.331a1.71 1.71 0 0 0 1.708 1.708h14.937a1.71 1.71 0 0 0 1.708-1.707V7.221v-.002z"/>
      <path class="file-icon__outline" d="M18.354 5.951v-.004c0-.014-.006-.026-.008-.039-.004-.03-.006-.06-.018-.089a.318.318 0 0 0-.055-.085c-.006-.008-.009-.017-.016-.025l-.002-.003-.003-.003L12.801.104 12.8.103a.338.338 0 0 0-.238-.102h-.001L12.556 0H1.708A1.71 1.71 0 0 0 0 1.708v19.331a1.71 1.71 0 0 0 1.708 1.708h14.937a1.71 1.71 0 0 0 1.708-1.707V5.953l.001-.002zm-5.457-4.768l4.305 4.422h-4.305V1.183zm3.749 20.881H1.708c-.565 0-1.025-.46-1.025-1.025V1.708c0-.565.46-1.025 1.025-1.025h10.506v5.264c0 .189.153.342.342.342h5.115v14.75a1.027 1.027 0 0 1-1.025 1.025z"/>
      <path class="file-icon__type" d="M9.416 15.795H7.584l-.3.66h-.716l1.572-3.504h.72l1.571 3.504h-.72l-.295-.66zM8.5 13.688l-.651 1.491H9.15l-.65-1.491zM10.729 16.455v-3.504h.655v3.504h-.655z"/>
    </svg>`;
       const doc = `<svg class="icon file-icon file-icon--doc" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19.607 24">
      <path class="file-icon__shadow" d="M19.592 7.219v-.004c0-.014-.006-.026-.008-.039-.004-.03-.006-.06-.018-.089a.318.318 0 0 0-.055-.085c-.006-.008-.009-.017-.016-.025l-.002-.003-.003-.003-5.451-5.599-.001-.001a.338.338 0 0 0-.238-.102h-.001l-.005-.001H2.947a1.71 1.71 0 0 0-1.708 1.708v19.331a1.71 1.71 0 0 0 1.708 1.708h14.937a1.71 1.71 0 0 0 1.708-1.707V7.221v-.002z"/>
      <path class="file-icon__outline" d="M18.354 5.951v-.004c0-.014-.006-.026-.008-.039-.004-.03-.006-.06-.018-.089a.318.318 0 0 0-.055-.085c-.006-.008-.009-.017-.016-.025l-.002-.003-.003-.003L12.801.104 12.8.103a.338.338 0 0 0-.238-.102h-.001L12.556 0H1.708A1.71 1.71 0 0 0 0 1.708v19.331a1.71 1.71 0 0 0 1.708 1.708h14.937a1.71 1.71 0 0 0 1.708-1.707V5.953l.001-.002zm-5.457-4.768l4.305 4.422h-4.305V1.183zm3.749 20.881H1.708c-.565 0-1.025-.46-1.025-1.025V1.708c0-.565.46-1.025 1.025-1.025h10.506v5.264c0 .189.153.342.342.342h5.115v14.75a1.027 1.027 0 0 1-1.025 1.025z"/>
      <path class="file-icon__type" d="M7.104 14.674c.015.886-.525 1.781-1.751 1.781H3.977v-3.504h1.376c1.201 0 1.736.857 1.751 1.723zm-2.472 1.145h.721c.796 0 1.111-.58 1.096-1.151-.015-.545-.335-1.091-1.096-1.091h-.721v2.242zM11.079 14.724c-.01.905-.565 1.812-1.797 1.812-1.231 0-1.802-.886-1.802-1.807s.591-1.847 1.802-1.847c1.207 0 1.808.926 1.797 1.842zm-2.948.014c.015.576.325 1.191 1.151 1.191s1.136-.621 1.146-1.196c.01-.591-.32-1.251-1.146-1.251-.825 0-1.166.665-1.151 1.256zM14.699 16.015c-.36.355-.826.521-1.331.521-1.302 0-1.853-.896-1.857-1.807-.005-.916.591-1.847 1.857-1.847.476 0 .926.18 1.286.535l-.44.426a1.201 1.201 0 0 0-.846-.331c-.846 0-1.212.631-1.206 1.217.005.58.34 1.186 1.206 1.186.305 0 .65-.125.881-.354l.45.454z"/>
    </svg>`;
       const xls = `<svg class="icon file-icon file-icon--xls" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19.607 24">
      <path class="file-icon__shadow" d="M19.592 7.219v-.004c0-.014-.006-.026-.008-.039-.004-.03-.006-.06-.018-.089a.318.318 0 0 0-.055-.085c-.006-.008-.009-.017-.016-.025l-.002-.003-.003-.003-5.451-5.599-.001-.001a.338.338 0 0 0-.238-.102h-.001l-.005-.001H2.947a1.71 1.71 0 0 0-1.708 1.708v19.331a1.71 1.71 0 0 0 1.708 1.708h14.937a1.71 1.71 0 0 0 1.708-1.707V7.221v-.002z"/>
      <path class="file-icon__outline" d="M18.354 5.951v-.004c0-.014-.006-.026-.008-.039-.004-.03-.006-.06-.018-.089a.318.318 0 0 0-.055-.085c-.006-.008-.009-.017-.016-.025l-.002-.003-.003-.003L12.801.104 12.8.103a.338.338 0 0 0-.238-.102h-.001L12.556 0H1.708A1.71 1.71 0 0 0 0 1.708v19.331a1.71 1.71 0 0 0 1.708 1.708h14.937a1.71 1.71 0 0 0 1.708-1.707V5.953l.001-.002zm-5.457-4.768l4.305 4.422h-4.305V1.183zm3.749 20.881H1.708c-.565 0-1.025-.46-1.025-1.025V1.708c0-.565.46-1.025 1.025-1.025h10.506v5.264c0 .189.153.342.342.342h5.115v14.75a1.027 1.027 0 0 1-1.025 1.025z"/>
      <path class="file-icon__type" d="M6.916 12.951h.726v.03l-1.186 1.702 1.221 1.752v.02h-.741l-.896-1.316-.896 1.316h-.741v-.02l1.216-1.752-1.181-1.702v-.03h.726l.876 1.307.876-1.307zM8.774 12.951v2.894h1.802v.61H8.113v-3.504h.661zM13.251 13.798c-.12-.2-.45-.391-.831-.391-.49 0-.726.205-.726.466 0 .305.36.39.78.439.731.091 1.412.281 1.412 1.116 0 .781-.691 1.116-1.472 1.116-.716 0-1.267-.22-1.527-.86l.551-.285c.154.385.561.556.985.556.416 0 .806-.146.806-.526 0-.33-.345-.465-.811-.515-.716-.086-1.376-.275-1.376-1.062 0-.721.71-1.016 1.356-1.021.545 0 1.11.154 1.376.695l-.523.272z"/>
    </svg>`;
       const pdf = `<svg class="icon file-icon file-icon--pdf" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19.607 24">
      <path class="file-icon__shadow" d="M19.592 7.219v-.004c0-.014-.006-.026-.008-.039-.004-.03-.006-.06-.018-.089a.318.318 0 0 0-.055-.085c-.006-.008-.009-.017-.016-.025l-.002-.003-.003-.003-5.451-5.599-.001-.001a.338.338 0 0 0-.238-.102h-.001l-.005-.001H2.947a1.71 1.71 0 0 0-1.708 1.708v19.331a1.71 1.71 0 0 0 1.708 1.708h14.937a1.71 1.71 0 0 0 1.708-1.707V7.221v-.002z"/>
      <path class="file-icon__outline" d="M18.354 5.951v-.004c0-.014-.006-.026-.008-.039-.004-.03-.006-.06-.018-.089a.318.318 0 0 0-.055-.085c-.006-.008-.009-.017-.016-.025l-.002-.003-.003-.003L12.801.104 12.8.103a.338.338 0 0 0-.238-.102h-.001L12.556 0H1.708A1.71 1.71 0 0 0 0 1.708v19.331a1.71 1.71 0 0 0 1.708 1.708h14.937a1.71 1.71 0 0 0 1.708-1.707V5.953l.001-.002zm-5.457-4.768l4.305 4.422h-4.305V1.183zm3.749 20.881H1.708c-.565 0-1.025-.46-1.025-1.025V1.708c0-.565.46-1.025 1.025-1.025h10.506v5.264c0 .189.153.342.342.342h5.115v14.75a1.027 1.027 0 0 1-1.025 1.025z"/>
      <path class="file-icon__type" d="M6.083 15.424h-.992v1.031h-.66v-3.504c.551 0 1.101-.005 1.652-.005 1.711 0 1.716 2.478 0 2.478zm-.992-.606h.991c.846 0 .841-1.241 0-1.241h-.991v1.241zM10.944 14.674c.015.886-.525 1.781-1.751 1.781H7.817v-3.504h1.376c1.201 0 1.736.857 1.751 1.723zm-2.472 1.145h.721c.796 0 1.111-.58 1.096-1.151-.015-.545-.335-1.091-1.096-1.091h-.721v2.242zM11.531 16.455v-3.498h2.518v.635h-1.857v.956h1.757v.611h-1.757v1.296h-.661z"/>
    </svg>`;
       const png = `<svg class="icon file-icon file-icon--png" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19.607 24">
      <path class="file-icon__shadow" d="M19.592 7.219v-.004c0-.014-.006-.026-.008-.039-.004-.03-.006-.06-.018-.089a.318.318 0 0 0-.055-.085c-.006-.008-.009-.017-.016-.025l-.002-.003-.003-.003-5.451-5.599-.001-.001a.338.338 0 0 0-.238-.102h-.001l-.005-.001H2.947a1.71 1.71 0 0 0-1.708 1.708v19.331a1.71 1.71 0 0 0 1.708 1.708h14.937a1.71 1.71 0 0 0 1.708-1.707V7.221v-.002z"/>
      <path class="file-icon__outline" d="M18.354 5.951v-.004c0-.014-.006-.026-.008-.039-.004-.03-.006-.06-.018-.089a.318.318 0 0 0-.055-.085c-.006-.008-.009-.017-.016-.025l-.002-.003-.003-.003L12.801.104 12.8.103a.338.338 0 0 0-.238-.102h-.001L12.556 0H1.708A1.71 1.71 0 0 0 0 1.708v19.331a1.71 1.71 0 0 0 1.708 1.708h14.937a1.71 1.71 0 0 0 1.708-1.707V5.953l.001-.002zm-5.457-4.768l4.305 4.422h-4.305V1.183zm3.749 20.881H1.708c-.565 0-1.025-.46-1.025-1.025V1.708c0-.565.46-1.025 1.025-1.025h10.506v5.264c0 .189.153.342.342.342h5.115v14.75a1.027 1.027 0 0 1-1.025 1.025z"/>
      <path class="file-icon__type" d="M5.773 15.424h-.991v1.031h-.661v-3.504c.551 0 1.101-.005 1.652-.005 1.711 0 1.716 2.478 0 2.478zm-.991-.606h.991c.846 0 .841-1.241 0-1.241h-.991v1.241zM9.854 12.946h.661v3.509h-.41v.005l-1.842-2.367v2.362h-.661v-3.504h.535l1.717 2.173v-2.178zM13.769 13.808a1.338 1.338 0 0 0-.891-.351c-.751 0-1.206.57-1.206 1.291 0 .576.335 1.172 1.206 1.172.275 0 .516-.061.791-.28v-.621h-.896v-.591h1.502v1.477c-.346.396-.781.631-1.396.631-1.316 0-1.852-.866-1.852-1.787 0-.985.615-1.896 1.852-1.896.471 0 .941.18 1.302.535l-.412.42z"/>
    </svg>`;
       const jpg = `<svg class="icon file-icon file-icon--jpg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19.607 24">
      <path class="file-icon__shadow" d="M19.592 7.219v-.004c0-.014-.006-.026-.008-.039-.004-.03-.006-.06-.018-.089a.318.318 0 0 0-.055-.085c-.006-.008-.009-.017-.016-.025l-.002-.003-.003-.003-5.451-5.599-.001-.001a.338.338 0 0 0-.238-.102h-.001l-.005-.001H2.947a1.71 1.71 0 0 0-1.708 1.708v19.331a1.71 1.71 0 0 0 1.708 1.708h14.937a1.71 1.71 0 0 0 1.708-1.707V7.221v-.002z"/>
      <path class="file-icon__outline" d="M18.354 5.951v-.004c0-.014-.006-.026-.008-.039-.004-.03-.006-.06-.018-.089a.318.318 0 0 0-.055-.085c-.006-.008-.009-.017-.016-.025l-.002-.003-.003-.003L12.801.104 12.8.103a.338.338 0 0 0-.238-.102h-.001L12.556 0H1.708A1.71 1.71 0 0 0 0 1.708v19.331a1.71 1.71 0 0 0 1.708 1.708h14.937a1.71 1.71 0 0 0 1.708-1.707V5.953l.001-.002zm-5.457-4.768l4.305 4.422h-4.305V1.183zm3.749 20.881H1.708c-.565 0-1.025-.46-1.025-1.025V1.708c0-.565.46-1.025 1.025-1.025h10.506v5.264c0 .189.153.342.342.342h5.115v14.75a1.027 1.027 0 0 1-1.025 1.025z"/>
      <path class="file-icon__type" d="M7.064 14.959c0 .905-.576 1.566-1.542 1.566-.896 0-1.537-.536-1.537-1.526h.651c0 .601.29.905.886.905.601 0 .881-.415.881-.945v-1.392H5.347v-.616h1.717v2.008zM9.383 15.424h-.991v1.031h-.661v-3.504c.551 0 1.101-.005 1.652-.005 1.712 0 1.717 2.478 0 2.478zm-.991-.606h.991c.846 0 .841-1.241 0-1.241h-.991v1.241z"/>
      <path class="file-icon__type" d="M13.764 13.808a1.338 1.338 0 0 0-.891-.351c-.751 0-1.206.57-1.206 1.291 0 .576.335 1.172 1.206 1.172.275 0 .516-.061.791-.28v-.621h-.896v-.591h1.502v1.477c-.346.396-.781.631-1.396.631-1.316 0-1.852-.866-1.852-1.787 0-.985.615-1.896 1.852-1.896.471 0 .941.18 1.302.535l-.412.42z"/>
    </svg>`;
       const unknown = `<svg class="icon file-icon file-icon--unknown" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19.607 24">
      <path class="file-icon__shadow" d="M19.592 7.219v-.004c0-.014-.006-.026-.008-.039-.004-.03-.006-.06-.018-.089a.318.318 0 0 0-.055-.085c-.006-.008-.009-.017-.016-.025l-.002-.003-.003-.003-5.451-5.599-.001-.001a.338.338 0 0 0-.238-.102h-.001l-.005-.001H2.947a1.71 1.71 0 0 0-1.708 1.708v19.331a1.71 1.71 0 0 0 1.708 1.708h14.937a1.71 1.71 0 0 0 1.708-1.707V7.221v-.002z"/>
      <path class="file-icon__outline" d="M18.354 5.951v-.004c0-.014-.006-.026-.008-.039-.004-.03-.006-.06-.018-.089a.318.318 0 0 0-.055-.085c-.006-.008-.009-.017-.016-.025l-.002-.003-.003-.003L12.801.104 12.8.103a.338.338 0 0 0-.238-.102h-.001L12.556 0H1.708A1.71 1.71 0 0 0 0 1.708v19.331a1.71 1.71 0 0 0 1.708 1.708h14.937a1.71 1.71 0 0 0 1.708-1.707V5.953l.001-.002zm-5.457-4.768l4.305 4.422h-4.305V1.183zm3.749 20.881H1.708c-.565 0-1.025-.46-1.025-1.025V1.708c0-.565.46-1.025 1.025-1.025h10.506v5.264c0 .189.153.342.342.342h5.115v14.75a1.027 1.027 0 0 1-1.025 1.025z"/>
    </svg>`;
      
      const list = document.getElementById('files');
      //console.log(list)
      
      let currNumOfFiles = document.getElementById('files').children.length;
      //console.log("Curr: " + currNumOfFiles)
      let newNumOfFiles = files.length;
      //console.log("New: " + newNumOfFiles)
      let total = Math.abs(currNumOfFiles + newNumOfFiles);
      //console.log("Total: " + total)
      let idx;
      
      for (let i = currNumOfFiles; i < total; i++) {
        idx = i; 
        if (currNumOfFiles > 0) {
          idx = i-currNumOfFiles;
        }
        
        let fileName = files[idx].name;
        let subFileName = fileName.substr(fileName.length - 5).toLowerCase();
        let icon;
      
        if (subFileName.substr(subFileName.length - 4) == ".psd") icon = psd;
        else if (subFileName.substr(subFileName.length - 3) == ".ai") icon = ai;
        else if (subFileName.substr(subFileName.length - 4) == ".doc") icon = doc;
        else if (subFileName == ".docx") icon = doc;
        else if (subFileName.substr(subFileName.length - 4) == ".xls") icon = xls;
        else if (subFileName == ".xlsx") icon = xls;
        else if (subFileName.substr(subFileName.length - 4) == ".pdf") icon = pdf;
        else if (subFileName.substr(subFileName.length - 4) == ".png") icon = png;
        else if (subFileName.substr(subFileName.length - 4) == ".jpg") icon = jpg;
        else if (subFileName == ".jpeg") icon = jpg;
        else icon = unknown;
        
        list.innerHTML +=
          `<div class="file--container">\n` +
            `<div class="file--icons">${icon}</div>` +
            `<div class="file--content">` +
              `<div class="file--content-flex">` +
                `<div class="file--content-flex--name">${files[idx].name}</div>` +
                `<div id="img${i}" class="file--content-flex--uploaded"><i id="ic${i}" class="fa fa-times"></i></div>` +
              `</div>` +
              `<div class="file--progressBar">` +
                `<div id="pg${i}"></div>` +
              `</div>` +
            `</div>` +
          `</div>`;
      }
      
      // Fake random loading for progress bars
      for (let i=currNumOfFiles; i < total; i++){
        let bar = document.getElementById(`pg${i}`);
        let img = document.getElementById(`img${i}`);
        let icon = document.getElementById(`ic${i}`).classList;
        let width = 1;
        let id = setInterval(frame, Math.floor((Math.random()*29)+1)); //get random interval for each upload

        function frame() {
          if (width >= 100) {
            bar.style.backgroundColor = "#69C288";
            img.style.color = "#69C288";
            icon.replace('fa-times', 'fa-check');
            clearInterval(id);
            i = 0;
          } else {
            width++;
            bar.style.width = width + "%";
          }
        }    
      }
        
    }

    function FileUploadApp() {
      return (
        <div>
          <FileUpload receiveFiles={cb} />
        </div>
      )
    }

    ReactDOM.render(<FileUploadApp />, document.getElementById('root'));
*/