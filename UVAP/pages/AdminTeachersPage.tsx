import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { classes as ALL_CLASSES } from '../lib/constants';
import { Teacher } from '../lib/types';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import Table, { TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { UserPlus, Edit, Trash2, X, Loader2 } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

const modalBackdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
}

const modalContentVariants = {
    hidden: { opacity: 0, y: -50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 }
}


const AdminTeachersPage: React.FC = () => {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
    const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewingTeacher, setViewingTeacher] = useState<Teacher | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        assignedClasses: [] as string[],
    });
    
    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        setIsLoading(true);
        try {
            // NOTE: In a real app, you would proxy this request or use environment variables for the API URL.
            const response = await fetch('/api/admin/teachers');
            if (response.ok) {
                const data = await response.json();
                setTeachers(data);
            }
        } catch (error) {
            console.error("Failed to fetch teachers:", error);
        } finally {
            setIsLoading(false);
        }
    }
    
    useEffect(() => {
        if (editingTeacher) {
            setFormData({
                name: editingTeacher.name,
                email: editingTeacher.email,
                password: '',
                assignedClasses: editingTeacher.assignedClasses || [],
            });
        } else {
             setFormData({ name: '', email: '', password: '', assignedClasses: [] });
        }
    }, [editingTeacher, isModalOpen]);

    const handleOpenModal = (teacher: Teacher | null) => {
        setEditingTeacher(teacher);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTeacher(null);
    };
    
    const handleOpenViewModal = (teacher: Teacher) => {
        setViewingTeacher(teacher);
        setIsViewModalOpen(true);
    };

    const handleCloseViewModal = () => {
        setIsViewModalOpen(false);
        setViewingTeacher(null);
    };

    const handleClassToggle = (className: string) => {
        setFormData(prev => ({
            ...prev,
            assignedClasses: prev.assignedClasses.includes(className)
                ? prev.assignedClasses.filter(c => c !== className)
                : [...prev.assignedClasses, className]
        }));
    };

    const handleSave = async () => {
        const url = editingTeacher 
            ? `/api/admin/teachers/${editingTeacher.id}`
            : '/api/admin/teachers';
        
        const method = editingTeacher ? 'PUT' : 'POST';

        const body: any = {
            name: formData.name,
            email: formData.email,
            assignedClasses: formData.assignedClasses
        };

        if(!editingTeacher) {
            body.password = formData.password;
        }

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if(response.ok) {
                 await fetchTeachers(); // Refresh the list
            } else {
                console.error("Failed to save teacher:", await response.text());
            }
        } catch (error) {
            console.error("Error saving teacher:", error);
        }
        
        handleCloseModal();
    };
    
    const handleDelete = (teacher: Teacher) => {
        setTeacherToDelete(teacher);
    };

    const confirmDelete = async () => {
        if (teacherToDelete) {
             try {
                const response = await fetch(`/api/admin/teachers/${teacherToDelete.id}`, {
                    method: 'DELETE'
                });

                if(response.ok) {
                    setTeachers(teachers.filter(t => t.id !== teacherToDelete.id));
                } else {
                    console.error("Failed to delete teacher:", await response.text());
                }
            } catch (error) {
                console.error("Error deleting teacher:", error);
            }
            setTeacherToDelete(null);
        }
    };
    
  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Manage Teachers</h1>
        <Button onClick={() => handleOpenModal(null)}>
            <UserPlus className="mr-2 h-4 w-4"/>
            Add Teacher
        </Button>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Teacher Directory</CardTitle>
            <CardDescription>View, edit, or remove teacher accounts from the system.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
                 <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                 </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Teacher</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Assigned Classes</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {teachers.map((teacher) => (
                            <TableRow key={teacher.id}>
                                <TableCell className="font-medium">
                                    <button onClick={() => handleOpenViewModal(teacher)} className="flex items-center gap-3 text-left hover:text-blue-400 transition-colors duration-200 group">
                                        <img src={teacher.avatar} alt={teacher.name} className="h-10 w-10 rounded-full group-hover:ring-2 group-hover:ring-blue-500 transition-all" />
                                        <span className="group-hover:underline">{teacher.name}</span>
                                    </button>
                                </TableCell>
                                <TableCell>{teacher.email}</TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1 max-w-xs">
                                        {teacher.assignedClasses?.map(c => (
                                            <span key={c} className="px-2 py-1 text-xs font-semibold rounded-full bg-slate-700 text-slate-300">
                                                {c}
                                            </span>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" className="mr-2" onClick={() => handleOpenModal(teacher)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-400" onClick={() => handleDelete(teacher)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>
      
      {/* View Details Modal */}
      <AnimatePresence>
        {isViewModalOpen && viewingTeacher && (
             <motion.div
                variants={modalBackdropVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={handleCloseViewModal}
            >
                <motion.div
                    variants={modalContentVariants}
                    className="w-full max-w-md"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                             <div>
                                <CardTitle>Teacher Details</CardTitle>
                                <CardDescription>Full profile information.</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" onClick={handleCloseViewModal}><X className="h-4 w-4"/></Button>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center text-center">
                            <img src={viewingTeacher.avatar?.replace(/(\/\d+)/, '/200')} alt={viewingTeacher.name} className="h-24 w-24 rounded-full mb-4 border-2 border-blue-500 p-1" />
                            <h2 className="text-2xl font-bold text-white">{viewingTeacher.name}</h2>
                            <p className="text-sm text-slate-400">{viewingTeacher.email}</p>
                            
                            <div className="mt-6 w-full text-left">
                                <h3 className="font-semibold text-slate-300 mb-2">Assigned Classes</h3>
                                <div className="flex flex-wrap gap-2">
                                    {viewingTeacher.assignedClasses?.length > 0 ? viewingTeacher.assignedClasses.map(c => (
                                        <span key={c} className="px-3 py-1 text-sm font-semibold rounded-full bg-slate-700 text-slate-200">
                                            {c}
                                        </span>
                                    )) : (
                                       <p className="text-sm text-slate-500">No classes have been assigned.</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
             </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
             <motion.div
                variants={modalBackdropVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={handleCloseModal}
            >
                <motion.div
                    variants={modalContentVariants}
                    className="w-full max-w-lg"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                             <div>
                                <CardTitle>{editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}</CardTitle>
                                <CardDescription>Fill in the details below.</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" onClick={handleCloseModal}><X className="h-4 w-4"/></Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div>
                                <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">Name</label>
                                <Input id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                                <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                            </div>
                            {!editingTeacher && (
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                                    <Input id="password" type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Assigned Classes</label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-3 rounded-md border border-slate-700 bg-slate-900/50 max-h-48 overflow-y-auto">
                                    {ALL_CLASSES.map(cls => (
                                        <label key={cls} className="flex items-center gap-2 text-sm text-slate-200 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 rounded bg-slate-800 border-slate-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                                                checked={formData.assignedClasses.includes(cls)}
                                                onChange={() => handleClassToggle(cls)}
                                            />
                                            {cls}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
                                <Button onClick={handleSave}>Save Changes</Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
             </motion.div>
        )}
      </AnimatePresence>
      
       {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {teacherToDelete && (
             <motion.div
                variants={modalBackdropVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => setTeacherToDelete(null)}
            >
                <motion.div
                    variants={modalContentVariants}
                    className="w-full max-w-md"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>Confirm Deletion</CardTitle>
                            <CardDescription>Are you sure you want to delete the account for <span className="font-bold text-slate-200">{teacherToDelete.name}</span>? This action cannot be undone.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex justify-end gap-2">
                           <Button variant="secondary" onClick={() => setTeacherToDelete(null)}>Cancel</Button>
                           <Button variant="primary" className="bg-red-600 hover:bg-red-700" onClick={confirmDelete}>Delete</Button>
                        </CardContent>
                    </Card>
                </motion.div>
             </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default AdminTeachersPage;