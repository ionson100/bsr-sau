import React, { Component, ChangeEvent } from 'react';

interface AvatarProps {
    /**
     * Canvas size (square)
     */
    canvasSize: number;
    /**
     * File selection event
     * @param f selected file
     */
    selectedFile?: (f: File | null | undefined) => boolean | undefined;
    /**
     * User data that the user wants to send to the server along with the file
     */
    callbackFormData?: any;
    /**
     * Url server
     */
    url?: string;
    /**
     * An object with key - value fields that are inserted into the request header
     */
    headerKeyValue?: {
        [key: string]: string;
    };
    /**
     * Event marker before transferring the file to the server
     */
    beforeUpload?: () => void;
    /**
     * Browser side error event
     * @param event
     */
    clientError?: (event: string) => void;
    /**
     * Attributes for plotting download progress
     * @param events
     */
    progress?: (events: ProgressEvent<XMLHttpRequestEventTarget>) => void;
    /**
     * Click preview
     * @param events url image
     */
    preview?: (events: string) => void;
    /**
     * Continuous preview
     * @param events url image
     */
    previewAsync?: (events: string) => void;
    /**
     * Successful sending event to the server
     * @param events Data that the server side wants to transfer to the client
     */
    done?: (events: any) => void;
    /**
     * Server side error event
     * @param events
     */
    serverError?: (events: string) => void;
    /**
     * Show button Preview
     */
    visibleLinkPreview?: boolean;
    className?: string;
    classNameCanvas?: string;
}
declare class AvatarUploader extends Component<AvatarProps, any> {
    static defaultProps: AvatarProps;
    readonly mRefInputFile: React.RefObject<HTMLInputElement>;
    readonly mRefZoom: React.RefObject<HTMLInputElement>;
    readonly mRefRotDiv: React.RefObject<HTMLDivElement>;
    readonly mRefPanelButtons: React.RefObject<HTMLDivElement>;
    readonly mRefCanvas: React.RefObject<HTMLCanvasElement>;
    readonly mRefLink1: React.RefObject<HTMLDivElement>;
    readonly mRefLink2: React.RefObject<HTMLDivElement>;
    readonly coord: {
        x: number;
        y: number;
    };
    readonly coordE: {
        x: number;
        y: number;
    };
    readonly coordS: {
        x: number;
        y: number;
    };
    base_image: HTMLImageElement | undefined;
    isStart: boolean;
    mFile: any;
    imageSize: {
        width: number;
        height: number;
        scaleW: number;
    };
    mContext: CanvasRenderingContext2D | null;
    constructor(props: Readonly<AvatarProps>);
    componentDidMount(): void;
    wheel(e: WheelEvent): void;
    start(e: MouseEvent): void;
    stop(): void;
    reposition(e: MouseEvent): void;
    draw(e: MouseEvent): void;
    onFileChange(event: ChangeEvent<HTMLInputElement>): void;
    drawImageE(): void;
    zoomImage(v: number): void;
    previewF(): void;
    getCanvasFormData(): string;
    getWidth(): number;
    getHeight(): number;
    formUpload(): void;
    clear(): void;
    render(): React.JSX.Element;
}

export { AvatarUploader as default };
