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
import { BiSolidEdit } from "react-icons/bi";
import PageHeader from '@/components/PageHeader';
import Table from "@/components/Table";

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

    // Cấu hình cột cho bảng
    const columnsConfig = [
        { field: 'typeCode', headerName: 'Mã nhóm đối tác', minWidth: 150, flex: 1, editable: false },
        { field: 'typeName', headerName: 'Tên nhóm đối tác', minWidth: 250, flex: 2, editable: false },
        { field: 'description', headerName: 'Mô tả', minWidth: 400, flex: 2, editable: false },
        {
            field: 'status',
            headerName: 'Trạng thái',
            minWidth: 200,
            flex: 1,
            editable: false,
            renderCell: (params) => (
                <div className="flex items-center gap-2">
                    <Switch
                        color="green"
                        checked={params.value}
                        onChange={() => toggleStatus(params.row.id, params.value)}
                    />
                    <Typography className="text-xs font-semibold text-blue-gray-600">
                        {params.value ? "Hoạt động" : "Vô hiệu hóa"}
                    </Typography>
                </div>
            ),
        },
        {
            field: 'actions',
            headerName: 'Hành động',
            minWidth: 30,
            flex: 0.5,
            renderCell: (params) => (
                <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                    <Tooltip content="Chỉnh sửa">
                        <button
                            onClick={() => {
                                setEditPartnerType(params.row);
                                setShowEditPopup(true);
                            }}
                            className="p-1.5 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
                        >
                            <BiSolidEdit className="h-5 w-5" />
                        </button>
                    </Tooltip>
                </div>
            ),
        }
    ];

    // Xử lý dữ liệu cho bảng
    const data = partnerTypes.map(({ typeId, typeCode, typeName, description, status }) => ({
        id: typeId, // DataGrid cần trường 'id'
        typeCode,
        typeName,
        description,
        status
    }));

    return (
        <div className="mb-8 flex flex-col gap-12" style={{ height: 'calc(100vh-100px)' }}>
            <Card className="bg-gray-50 p-7 rounded-none shadow-none">

                <CardBody className="pb-4 bg-white rounded-xl">
                    <PageHeader
                        title="Danh sách nhóm đối tác"
                        addButtonLabel="Thêm nhóm đối tác"
                        onAdd={() => setShowCreatePopup(true)}
                        showImport={false}
                        showExport={false}
                    />

                    <Table
                        data={data}
                        columnsConfig={columnsConfig}
                        enableSelection={false}
                    />
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
            {showEditPopup && editPartnerType && (
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
