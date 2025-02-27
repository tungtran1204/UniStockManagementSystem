import React, { useEffect, useState } from "react";
import usePartnerType from "./usePartnerType";
import CreatePartnerTypePopUp from "./CreatePartnerTypePopUp";
import EditPartnerTypePopUp from "./EditPartnerTypePopUp";
import {
    Card,
    CardHeader,
    CardBody,
    Typography,
    Button,
    Tooltip,
    Switch,
} from "@material-tailwind/react";
import { FaEdit, FaPlus } from "react-icons/fa";

const PartnerTypePage = () => {
    const { partnerTypes, fetchPartnerTypes, toggleStatus } = usePartnerType();
    const [showCreatePopup, setShowCreatePopup] = useState(false);
    const [showEditPopup, setShowEditPopup] = useState(false);
    const [editPartnerType, setEditPartnerType] = useState(null);

    useEffect(() => {
        fetchPartnerTypes().then((data) => {
            console.log("📢 API trả về danh sách Partner Types:", data);
        });
    }, []);

    return (
        <div className="mt-12 mb-8 flex flex-col gap-12">
            <Card>
                <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
                    <div className="flex justify-between items-center">
                        <Typography variant="h6" color="white">
                            Danh sách nhóm đối tác
                        </Typography>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                color="white"
                                variant="text"
                                className="flex items-center gap-2"
                                onClick={() => {
                                    setShowCreatePopup(true);
                                }}
                            >
                                <FaPlus className="h-4 w-4" /> Thêm nhóm đối tác
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
                    <table className="w-full min-w-[640px] table-auto">
                        <thead>
                            <tr>
                                {["Mã nhóm đối tác", "Tên nhóm đối tác", "Mô tả", "Trạng thái", "Hành động"].map((el) => (
                                    <th
                                        key={el}
                                        className="border-b border-blue-gray-50 py-3 px-5 text-left"
                                    >
                                        <Typography
                                            variant="small"
                                            className="text-[11px] font-bold uppercase text-blue-gray-400"
                                        >
                                            {el}
                                        </Typography>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {partnerTypes && partnerTypes.length > 0 ? (
                                partnerTypes.map(({ typeId, typeCode, typeName, description, status }, key) => {
                                    const className = `py-3 px-5 ${key === partnerTypes.length - 1 ? "" : "border-b border-blue-gray-50"
                                        }`;

                                    return (
                                        <tr key={typeId}>
                                            <td className={className}>
                                                <Typography
                                                    variant="small"
                                                    color="blue-gray"
                                                    className="font-semibold"
                                                >
                                                    {typeCode}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography
                                                    variant="small"
                                                    color="blue-gray"
                                                    className="font-semibold"
                                                >
                                                    {typeName}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {description}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <div className="flex items-center gap-2">
                                                    <Switch
                                                        color="green"
                                                        checked={status}
                                                        onChange={() => {
                                                            toggleStatus(typeId, status);
                                                        }}
                                                    />
                                                    <Typography className="text-xs font-semibold text-blue-gray-600">
                                                        {status ? "Hoạt động" : "Vô hiệu hóa"}
                                                    </Typography>
                                                </div>
                                            </td>
                                            <td className={className}>
                                                <div className="flex items-center gap-2 pl-4">
                                                    <Tooltip content="Chỉnh sửa">
                                                        <button
                                                            onClick={() => {
                                                                setEditPartnerType({ typeId, typeCode, typeName, description, status });
                                                                setShowEditPopup(true);
                                                            }}
                                                            className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
                                                            style={{ paddingLeft: "10px" }}
                                                        >
                                                            <FaEdit />
                                                        </button>
                                                    </Tooltip>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td
                                        colSpan="4"
                                        className="border-b border-gray-200 px-3 py-4 text-center text-gray-500"
                                    >
                                        Không có dữ liệu
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </CardBody>
            </Card>

            {/* Popup tạo nhóm đối tác mới */}
            {showCreatePopup && (
                <CreatePartnerTypePopUp
                    onClose={() => setShowCreatePopup(false)}
                    onSuccess={fetchPartnerTypes}
                />
            )}

            {/* Popup chỉnh sửa nhóm đối tác */}
            {showEditPopup && editPartnerType &&(
                <EditPartnerTypePopUp
                    partnerType={editPartnerType}
                    onClose={() => setShowEditPopup(false)}
                    onSuccess={fetchPartnerTypes}
                />
            )}
        </div>
    );
};

export default PartnerTypePage;
