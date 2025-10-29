import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TEACHERS_DATA } from '../lib/constants';
import { Teacher } from '../lib/types';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import Table, { TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { UserPlus, Edit, Trash2, X } from 'lucide-react';

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
    const [teachers, setTeachers] = useState<Teacher[]>(TEACHERS_DATA);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
    const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewingTeacher, setViewingTeacher] = useState<Teacher | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        assignedClasses: '',
    });
    
    useEffect(() => {
        if (editingTeacher) {
            setFormData({
                name: editingTeacher.name,
                email: editingTeacher.email,
                assignedClasses: editingTeacher.assignedClasses.join(', '),
            });
        } else {
             setFormData({ name: '', email: '', assignedClasses: '' });
        }
    }, [editingTeacher]);

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


    const handleSave = () => {
        const classes = formData.assignedClasses.split(',').map(c => c.trim()).filter(Boolean);

        if (editingTeacher) {
            setTeachers(teachers.map(t => t.id === editingTeacher.id ? { ...t, ...formData, assignedClasses: classes } : t));
        } else {
            const newTeacher: Teacher = {
                id: Date.now().toString(),
                avatar: `https://i.pravatar.cc/150?u=${Date.now()}`,
                ...formData,
                assignedClasses: classes,
            };
            setTeachers([...teachers, newTeacher]);
        }
        handleCloseModal();
    };
    
    const handleDelete = (teacher: Teacher) => {
        setTeacherToDelete(teacher);
    };

    const confirmDelete = () => {
        if (teacherToDelete) {
            setTeachers(teachers.filter(t => t.id !== teacherToDelete.id));
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
                                <div className="flex flex-wrap gap-1">
                                    {teacher.assignedClasses.map(c => (
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
                            <img src={viewingTeacher.avatar.replace(/(\/\d+)/, '/200')} alt={viewingTeacher.name} className="h-24 w-24 rounded-full mb-4 border-2 border-blue-500 p-1" />
                            <h2 className="text-2xl font-bold text-white">{viewingTeacher.name}</h2>
                            <p className="text-sm text-slate-400">{viewingTeacher.email}</p>
                            
                            <div className="mt-6 w-full text-left">
                                <h3 className="font-semibold text-slate-300 mb-2">Assigned Classes</h3>
                                <div className="flex flex-wrap gap-2">
                                    {viewingTeacher.assignedClasses.length > 0 ? viewingTeacher.assignedClasses.map(c => (
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
                            <div>
                                <label htmlFor="classes" className="block text-sm font-medium text-slate-300 mb-1">Assigned Classes</label>
                                <Input id="classes" value={formData.assignedClasses} onChange={(e) => setFormData({...formData, assignedClasses: e.target.value})} placeholder="e.g., CS101, MATH203" />
                                <p className="text-xs text-slate-400 mt-1">Enter classes separated by commas.</p>
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