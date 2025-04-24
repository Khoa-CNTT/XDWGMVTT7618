import React, { useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react';
import { FaEdit } from 'react-icons/fa'; // Đừng quên import nếu dùng

export const A_TableDetail = ({ selectedTable, setShowQRModal }) => {
    const svgRef = useRef();

    const handleDownload = () => {
        const svgElement = svgRef.current;

        const svgData = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = svgElement.clientWidth;
            canvas.height = svgElement.clientHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            URL.revokeObjectURL(url);

            const pngUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = pngUrl;
            link.download = `qr-table-${selectedTable.tb_number}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

        img.src = url;
    };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">QR Code: Bàn {selectedTable.tb_number}</h2>
                    <button
                        className="text-gray-500 hover:text-gray-700"
                        onClick={() => setShowQRModal(false)}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                <div className="flex flex-col items-center justify-center p-4 bg-gray-100 rounded-lg">
                    <div className="w-48 h-48 bg-white p-2 rounded-lg shadow-md flex items-center justify-center">
                        <QRCodeSVG
                            ref={svgRef}
                            value={`${process.env.REACT_APP_URL}/?table=${selectedTable.tb_number}&id=${selectedTable._id}`}
                            size={160}
                        />
                    </div>
                    <p className="mt-4 text-center text-sm text-gray-600">
                        Quét mã QR này để truy cập thông tin bàn {selectedTable.tb_number}
                    </p>
                    <div className="mt-4 flex space-x-2">
                        {/* <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center">
                            <FaEdit className="w-4 h-4 mr-2" />
                            Tạo lại
                        </button> */}
                        <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                            onClick={handleDownload}>
                            Tải xuống
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
