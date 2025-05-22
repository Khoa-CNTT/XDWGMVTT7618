import React, { useEffect, useRef, useState } from "react";
import * as tmImage from "@teachablemachine/image";

const TeachableComponent = () => {
    const [prediction, setPrediction] = useState(null);
    const webcamRef = useRef(null);
    const modelRef = useRef(null);
    const webcamInstance = useRef(null);
    const maxPredictionsRef = useRef(0);

    const modelURL = "https://teachablemachine.withgoogle.com/models/q0RMXzwpz/";

    const loadModel = async () => {
        const modelURLJSON = modelURL + "model.json";
        const metadataURL = modelURL + "metadata.json";

        modelRef.current = await tmImage.load(modelURLJSON, metadataURL);
        maxPredictionsRef.current = modelRef.current.getTotalClasses();

        webcamInstance.current = new tmImage.Webcam(200, 200, true);
        await webcamInstance.current.setup();
        await webcamInstance.current.play();

        webcamRef.current.appendChild(webcamInstance.current.canvas);

        window.requestAnimationFrame(loop);
    };

    const loop = async () => {
        webcamInstance.current.update();
        await predict();
        window.requestAnimationFrame(loop);
    };

    const predict = async () => {
        const prediction = await modelRef.current.predict(webcamInstance.current.canvas);
        prediction.sort((a, b) => b.probability - a.probability);
        setPrediction(prediction[0]);
    };

    useEffect(() => {
        loadModel();
    }, []);

    return (
        <div>
            <h2>Teachable Machine with React</h2>
            <div ref={webcamRef} />
            {prediction && (
                <p>
                    Nhãn: <strong>{prediction.className}</strong> - Xác suất:{" "}
                    {(prediction.probability * 100).toFixed(2)}%
                </p>
            )}
        </div>
    );
};

export default TeachableComponent;
