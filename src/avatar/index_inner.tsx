import React, {ChangeEvent, Component, createRef} from 'react';

//import './index.css'


interface AvatarProps {

    /**
     * Canvas size (square)
     */
    canvasSize: number,

    /**
     * File selection event
     * @param f selected file
     */
    selectedFile?: (f: File | null | undefined) => boolean | undefined,


    /**
     * User data that the user wants to send to the server along with the file
     */
    callbackFormData?: any,


    /**
     * Url server
     */
    url?: string,


    /**
     * An object with key - value fields that are inserted into the request header
     */
    headerKeyValue?: { [key: string]: string },


    /**
     * Event marker before transferring the file to the server
     */
    beforeUpload?: () => void,


    /**
     * Browser side error event
     * @param event
     */
    clientError?: (event: string) => void,


    /**
     * Attributes for plotting download progress
     * @param events
     */
    progress?: (events: ProgressEvent<XMLHttpRequestEventTarget>) => void,

    /**
     * Click preview
     * @param events url image
     */
    preview?: (events: string) => void,

    /**
     * Continuous preview
     * @param events url image
     */
    previewAsync?: (events: string) => void,
    /**
     * Successful sending event to the server
     * @param events Data that the server side wants to transfer to the client
     */
    done?: (events: any) => void,

    /**
     * Server side error event
     * @param events
     */
    serverError?: (events: string) => void,


    /**
     * Show button Preview
     */
    visibleLinkPreview?: boolean,
    className?: string,
    classNameCanvas?: string



}

export default class AvatarUploader extends Component<AvatarProps, any> {
    static defaultProps: AvatarProps = {
        canvasSize: 200,
        selectedFile: undefined,
        callbackFormData: undefined,
        url: undefined,
        headerKeyValue: undefined,
        beforeUpload: undefined,
        clientError: undefined,
        progress: undefined,
        preview: undefined,
        previewAsync: undefined,
        done: undefined,
        serverError: undefined,
        visibleLinkPreview: undefined,
        className: 'sau',
        classNameCanvas: 'canvas-sau',

    };
    public readonly mRefInputFile: React.RefObject<HTMLInputElement>;
    public readonly mRefZoom: React.RefObject<HTMLInputElement>;
    public readonly mRefRotDiv: React.RefObject<HTMLDivElement>;
    public readonly mRefPanelButtons: React.RefObject<HTMLDivElement>;
    public readonly mRefCanvas: React.RefObject<HTMLCanvasElement>;
    public readonly mRefLink1: React.RefObject<HTMLDivElement>
    public readonly mRefLink2: React.RefObject<HTMLDivElement>;

    public readonly coord: { x: number, y: number };
    public readonly coordE: { x: number, y: number };
    public readonly coordS: { x: number, y: number };

    public base_image: HTMLImageElement | undefined;
    public isStart: boolean;
    public mFile: any;
    public imageSize: {
        width: number,
        height: number,
        scaleW: number,
    }
    public mContext: CanvasRenderingContext2D | null;


    constructor(props: Readonly<AvatarProps>) {
        super(props);
        this.mRefInputFile = createRef()
        this.mRefZoom = createRef()
        this.mRefRotDiv = createRef()
        this.mRefPanelButtons = createRef()
        this.mRefCanvas = createRef()
        this.mRefLink1 = createRef()
        this.mRefLink2 = createRef()

        this.coord = {x: 0, y: 0};
        this.coordE = {x: 0, y: 0};
        this.coordS = {x: 0, y: 0};
        this.base_image = undefined;
        this.isStart = false;
        this.mFile = undefined;
        this.imageSize = {
            width: this.props.canvasSize,
            height: this.props.canvasSize,
            scaleW: this.props.canvasSize,
        }
        this.mContext = null;

        this.onFileChange = this.onFileChange.bind(this)
        this.previewF = this.previewF.bind(this);
        this.formUpload = this.formUpload.bind(this);
        this.stop = this.stop.bind(this);
        this.start = this.start.bind(this)
        this.wheel = this.wheel.bind(this)
        this.draw = this.draw.bind(this)
    }

    componentDidMount() {

        this.mRefCanvas.current!.width = this.props.canvasSize
        this.mRefCanvas.current!.height = this.props.canvasSize
        this.mRefRotDiv.current!.style.width = `${this.props.canvasSize}px`;
        this.mRefRotDiv.current!.style.padding = `5px`;
        this.mContext = this.mRefCanvas.current!.getContext('2d');
        //
        this.mContext!.canvas.addEventListener("wheel", this.wheel);
        this.mContext!.canvas.addEventListener("mousedown", this.start);
        this.mContext!.canvas.addEventListener("mouseout", this.stop);
        this.mContext!.canvas.addEventListener("mouseup", this.stop);
        if (this.props.visibleLinkPreview !== true) {
            this.mRefLink1.current!.style.display = "none"
        }
    }


    wheel(e: WheelEvent) {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (!this.mFile) return;
        e = e || window.event;
        const v = parseInt(this.mRefZoom!.current!.value)
        const delta = e.deltaY || e.detail || e.deltaY;
        if (delta > 0 && v < 99) {
            this.mRefZoom.current!.value! = (v + 1) + "";
            this.zoomImage(100 - v)
        }
        if (delta < 0 && v > 0) {
            this.mRefZoom.current!.value! = (v - 1) + "";
            this.zoomImage(100 - v)
        }

    }

    start(e: MouseEvent) {

        this.mRefCanvas.current!.addEventListener("mousemove", this.draw);
        this.reposition(e);
        this.isStart = true;
    }

    stop() {
        if (!this.mFile) return;
        if (this.isStart) {
            this.coordS.x = this.coordE.x;
            this.coordS.y = this.coordE.y
            this.mRefCanvas.current!.removeEventListener("mousemove", this.draw);
            this.isStart = false;
        }
    }

    reposition(e: MouseEvent) {
        this.coord.x = e.offsetX
        this.coord.y = e.offsetY;
    }

    draw(e: MouseEvent) {
        if (!this.mFile) return;
        this.coordE.x = this.coordS.x + e.offsetX - this.coord.x;
        this.coordE.y = this.coordS.y + e.offsetY - this.coord.y;

        this.drawImageE();
    }

    onFileChange(event: ChangeEvent<HTMLInputElement>) {


        const fs = event.target.files;
        if (!fs) {
            return
        }

        const tempFile=fs!.item(0)
        if(!tempFile){
            return;
        }
        this.mFile = tempFile


        if (this.props.selectedFile) {
            if (!this.props.selectedFile(this.mFile)) {
                return;
            }
        }

        this.mRefZoom.current!.value = "0";
        this.coordE.x = this.coordE.y = this.coordS.x = this.coordS.y = this.coord.x = this.coord.y = 0;
        this.imageSize = {
            width: this.props.canvasSize,
            height: this.props.canvasSize,
            scaleW: 100,
        }


        const imgSrc = window.URL.createObjectURL(this.mFile);
        this.base_image = new Image();
        this.base_image.src = imgSrc;
        this.base_image.onload = () => {
            if (this.base_image?.width) {
                this.imageSize.width = this.base_image.width
            }
            if (this.base_image?.height) {
                this.imageSize.height = this.base_image.height
            }
            this.drawImageE();

        }
        this.mRefPanelButtons.current!.style.visibility = "visible";


    }

    drawImageE() {
        this.mContext!.clearRect(0, 0, this.mContext!.canvas.width, this.mContext!.canvas.height);
        this.mContext!.drawImage(this.base_image!, this.coordE.x, this.coordE.y, this.getWidth(), this.getHeight());
        if (this.props.previewAsync) {
            this.props.previewAsync(this.mContext!.canvas.toDataURL())
        }
    }

    zoomImage(v: number) {
        if (!this.mFile) return;

        this.imageSize.scaleW = v;

        this.drawImageE()
    }


    previewF() {
        if (this.props.preview) {
            this.props.preview(this.mContext!.canvas.toDataURL())
        }
    }
    public getCanvasFormData():string{
        return this.mContext!.canvas.toDataURL();
    }

    getWidth() {
        return Math.round(this.imageSize.width * this.imageSize.scaleW / 100);
    }

    getHeight() {
        return Math.round(this.imageSize.height * this.imageSize.scaleW / 100);
    }

    formUpload() {
        try {
            if (this.props.beforeUpload) {
                this.props.beforeUpload();
            }
            const xhr = new XMLHttpRequest();
            xhr.open("POST", this.props.url!);
            const formData = new FormData();
            if (this.props.callbackFormData) {

                if (typeof this.props.callbackFormData === 'function') {
                    formData.append("data", JSON.stringify(this.props.callbackFormData()))
                } else if (typeof this.props.callbackFormData === 'string') {
                    {
                        formData.append("data", this.props.callbackFormData)
                    }
                } else if (typeof this.props.callbackFormData === 'object') {
                    {
                        formData.append("data", JSON.stringify(this.props.callbackFormData))
                    }
                }

            }


            if (this.props.headerKeyValue) {
                for (const key in this.props.headerKeyValue) {

                    xhr.setRequestHeader(key, this.props.headerKeyValue[key]);
                }
            }
            formData.append("avatar", this.mContext!.canvas.toDataURL());
            xhr.onreadystatechange = (d) => {

                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        if (this.props.done) {
                            // @ts-ignore
                            this.props.done(d.target.response);
                            this.clear()
                        }
                    } else {
                        const innerText = `Error: ${xhr.status} ${xhr.statusText} ${xhr.responseText} `
                        if (this.props.serverError) {
                            this.props.serverError(innerText)
                        }
                    }

                }


            }
            xhr.upload.addEventListener("progress", (e) => {

                if (this.props.progress) {
                    this.props.progress(e)
                }
            });
            xhr.send(formData)
        } catch (e: any) {

            if (this.props.clientError) {
                this.props.clientError(e)
            }
        }

    }

    clear() {
        this.coord.x = 0;
        this.coord.y = 0;
        this.coordE.x = 0;
        this.coordE.y = 0;
        this.coordS.x = 0;
        this.coordS.y = 0
        this.base_image = undefined;
        this.isStart = false;
        this.mFile = undefined;
        this.mContext!.clearRect(0, 0, this.mRefCanvas.current!.width, this.mRefCanvas.current!.height);
        this.mRefPanelButtons.current!.style.visibility = "hidden"
        if(this.mRefInputFile.current){
            this.mRefInputFile.current.value='';
        }

    }

    render() {
        return (

            <>

                <div ref={this.mRefRotDiv} className={this.props.className}>
                    <div className='sau-head'>
                        <div id="sau-b-0" className="sau-link" onClick={() => {
                            this.mRefInputFile.current!.click()
                        }}>file
                        </div>
                        <input type="file" ref={this.mRefInputFile} className="sau-file" onChange={this.onFileChange}
                               accept="image/png, image/jpeg"/>
                    </div>

                    <div className='sau-attribute' style={{textAlign: "center"}}>

                        <canvas ref={this.mRefCanvas} className={this.props.classNameCanvas} id="sau"/>

                        <div ref={this.mRefPanelButtons} style={{visibility: "hidden"}}>

                            <div style={{display: "flex"}}>
                                <div style={{fontSize: 12}}>zoom:</div>
                                <input style={{width: "90%", paddingLeft: 5}} onChange={(e) => {
                                    const v = 100 - parseInt(e.target.value);
                                    this.zoomImage(v)
                                }} ref={this.mRefZoom} type="range" min="0" max="99" defaultValue="0" step="1"/>
                            </div>
                            <div ref={this.mRefLink1} id="sau-b-1" className="sau-link"
                                 onClick={this.previewF}>preview
                            </div>
                            <div ref={this.mRefLink2} id="sau-b-2" className="sau-link"
                                 onClick={this.formUpload}>upload
                            </div>


                        </div>

                    </div>
                </div>


            </>
        )
    }
};


