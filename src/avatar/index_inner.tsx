import React, {ChangeEvent, FC, ReactElement, useEffect, useRef} from 'react';
import './index.css'


type  AvatarProps =
    {

        canvasSize: number,
        selectedFile?: (f: File | null) => boolean,
        callbackFormData?:  | object | string,
        url?: string,
        headerKeyValue?: { [key: string]: string },
        beforeUpload?: () => void,
        clientError?: (event: string) => void,
        progress?: (events: ProgressEvent<XMLHttpRequestEventTarget>) => void,
        preview?: (events: string) => void,
        previewAsync?: (events: string) => void,
        done?: (events: any) => void,
        serverError?: (events: string) => void,
        visibleLinkPreview?: boolean,
        className?: string,
        classNameCanvas?: string


    }

 const AvatarUploader: FC<AvatarProps> = ({
                                                    canvasSize = 200,
                                                    selectedFile,
                                                    callbackFormData,
                                                    url = '/',
                                                    headerKeyValue,
                                                    beforeUpload,
                                                    clientError,
                                                    progress,
                                                    preview,
                                                    previewAsync,
                                                    done,
                                                    serverError,
                                                    visibleLinkPreview,
                                                    className = 'sau',
                                                    classNameCanvas = 'canvas-sau'

                                                }): ReactElement => {

    const coord = {x: 0, y: 0};
    const coordE = {x: 0, y: 0};
    const coordS = {x: 0, y: 0};
    let base_image:  HTMLImageElement|undefined = undefined;
    let isStart = false;

    let mFile: any = undefined;
    let imageSize = {
        width: canvasSize,
        height: canvasSize,
        scaleW: canvasSize,
    }
    let mContext: CanvasRenderingContext2D | null = null;

    const mRefInputFile = React.useRef<HTMLInputElement>(null);
    const mRefZoom = useRef<HTMLInputElement>(null);
    const mRefRotDiv = useRef<HTMLDivElement>(null)
    const mRefPanelButtons = useRef<HTMLDivElement>(null)
    const mRefCanvas = useRef<HTMLCanvasElement>(null);
    const mRefLink1 = useRef<HTMLDivElement>(null);
    const mRefLink2 = useRef<HTMLDivElement>(null)


    useEffect(() => {
        mRefCanvas.current!.width = canvasSize
        mRefCanvas.current!.height = canvasSize
        mRefRotDiv.current!.style.width = `${canvasSize}px`;
        mRefRotDiv.current!.style.padding = `5px`;
        mContext = mRefCanvas!.current!.getContext('2d');

        mContext!.canvas.addEventListener("wheel", wheel);
        mContext!.canvas.addEventListener("mousedown", start);
        mContext!.canvas.addEventListener("mouseout", stop);
        mContext!.canvas.addEventListener("mouseup", stop);
        if (visibleLinkPreview !== true) {
            mRefLink1.current!.style.display = "none"
        }
    }, [])


    const wheel = (e: WheelEvent) => {
        if (!mFile) return;
        e = e || window.event;
        const v = parseInt(mRefZoom!.current!.value)
        const delta = e.deltaY || e.detail || e.deltaY;
        if (delta > 0 && v < 99) {
            mRefZoom.current!.value! = (v + 1) + "";
            zoomImage(100 - v)
        }
        if (delta < 0 && v > 0) {
            mRefZoom.current!.value! = (v - 1) + "";
            zoomImage(100 - v)
        }
    }

    const start = (e: MouseEvent) => {
        mRefCanvas.current!.addEventListener("mousemove", draw);
        reposition(e);
        isStart = true;
    }

    const stop = () => {
        if (!mFile) return;
        if (isStart) {
            coordS.x = coordE.x;
            coordS.y = coordE.y
            mRefCanvas.current!.removeEventListener("mousemove", draw);
            isStart = false;
        }

    }

    const reposition = (e: MouseEvent) => {
        coord.x = e.offsetX
        coord.y = e.offsetY;
    }

    const draw = (e: MouseEvent) => {
        if (!mFile) return;
        coordE.x = coordS.x + e.offsetX - coord.x;
        coordE.y = coordS.y + e.offsetY - coord.y;
        console.log(coordE.x + "  " + coordE.y)
        drawImageE();
    }

    const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {


        const fs = event.target.files;
        if (!fs) {
            return
        }
        mFile = fs!.item(0)

        if (selectedFile) {
            if (!selectedFile(mFile)) {
                return;
            }
        }

        mRefZoom.current!.value = "0";
        coordE.x = coordE.y = coordS.x = coordS.y = coord.x = coord.y = 0;
        imageSize = {
            width: canvasSize,
            height: canvasSize,
            scaleW: 100,

        }


        const imgSrc = window.URL.createObjectURL(mFile);
        base_image = new Image();
        base_image.src = imgSrc;
        base_image.onload = function () {
            imageSize.width = base_image!.width
            imageSize.height = base_image!.height;
            drawImageE()
        }
        mRefPanelButtons.current!.style.visibility = "visible";


    }

    const drawImageE = () => {
        mContext!.clearRect(0, 0, mContext!.canvas.width, mContext!.canvas.height);
        mContext!.drawImage(base_image!, coordE.x, coordE.y, getWidth(), getHeight());
        if (previewAsync) {
            previewAsync(mContext!.canvas.toDataURL())
        }
    }

    const zoomImage = (v: number) => {
        if (!mFile) return;

        imageSize.scaleW = v;

        drawImageE()
    }

    const previewF = () => {
        if (preview) {
            preview(mContext!.canvas.toDataURL())
        }
    }
    const getWidth = () => {
        return Math.round(imageSize.width * imageSize.scaleW / 100);
    }

    const getHeight = () => {
        return Math.round(imageSize.height * imageSize.scaleW / 100);
    }

    const formUpload = () => {
        try {
            if (beforeUpload) {
                beforeUpload();
            }
            const xhr = new XMLHttpRequest();
            xhr.open("POST", url);
            const formData = new FormData();
            if (callbackFormData) {

                if (typeof callbackFormData === 'function') {
                    formData.append("data", JSON.stringify(callbackFormData()))
                } else if (typeof callbackFormData === 'string') {
                    {
                        formData.append("data", callbackFormData)
                    }
                } else if (typeof callbackFormData === 'object') {
                    {
                        formData.append("data", JSON.stringify(callbackFormData))
                    }
                }

            }


            if (headerKeyValue) {
                for (const key in headerKeyValue) {

                    xhr.setRequestHeader(key, headerKeyValue[key]);
                }
            }
            formData.append("avatar", mContext!.canvas.toDataURL());
            xhr.onreadystatechange = (d) => {

                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        if (done) {
                            // @ts-ignore
                            done(d.target.response);
                        }
                    } else {
                        const innerText = `Error: ${xhr.status} ${xhr.statusText} ${xhr.responseText} `
                        if (serverError) {
                            serverError(innerText)
                        }
                    }

                }
                clear()


            }
            xhr.upload.addEventListener("progress", (e) => {

                if (progress) {
                    progress(e)
                }
            });
            xhr.send(formData)
        } catch (e: any) {
            alert(e)
            if (clientError) {
                clientError(e)
            }
        }

    }

    const clear = () => {
        coord.x = 0;
        coord.y = 0;
        coordE.x = 0;
        coordE.y = 0;
        coordS.x = 0;
        coordS.y = 0
        base_image = undefined;
        isStart = false;
        mFile = undefined;

        mContext!.clearRect(0, 0, mRefCanvas.current!.width, mRefCanvas.current!.height);

        mRefPanelButtons.current!.style.visibility = "hidden"
    }

    return (

        <>

            <div ref={mRefRotDiv} className={className}>
                <div className='sau-head'>
                    <div id="sau-b-0" className="sau-link" onClick={() => {
                        mRefInputFile.current!.click()
                    }}>file
                    </div>
                    <input type="file" ref={mRefInputFile} className="sau-file" onChange={onFileChange}
                           accept="image/png, image/jpeg"/>
                </div>

                <div className='sau-attribute' style={{textAlign: "center"}}>

                    <canvas ref={mRefCanvas} className={classNameCanvas} id="sau"/>

                    <div ref={mRefPanelButtons} style={{visibility: "hidden"}}>

                        <div style={{display: "flex"}}>
                            <div style={{fontSize: 12}}>zoom:</div>
                            <input style={{width: "90%", paddingLeft: 5}} onChange={(e) => {
                                const v = 100 - parseInt(e.target.value);
                                zoomImage(v)
                            }} ref={mRefZoom} type="range" min="0" max="99" defaultValue="0" step="1"/>
                        </div>
                        <div ref={mRefLink1} id="sau-b-1" className="sau-link" onClick={previewF}>preview</div>
                        <div ref={mRefLink2} id="sau-b-2" className="sau-link" onClick={formUpload}>upload</div>


                    </div>

                </div>
            </div>


        </>
    )
};
export default AvatarUploader
