import '../cs/createuser.css';
import { useNavigate, useParams } from 'react-router-dom';
import React, { useState, useRef, useEffect } from 'react';
import { useGetUserByIdQuery, useUpdateUserMutation, useDeleteUserMutation } from '../../../../apis/userApi';
import { toast } from 'react-toastify';

function UpdateUser() {
  console.log('UpdateUser component mounted');
  const { id: userId } = useParams();
  console.log('User ID from params:', userId);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const { data: userData, isLoading: isLoadingUser, isError: isUserError, refetch } = useGetUserByIdQuery(userId);
  console.log('User Data Query State:', { isLoadingUser, isUserError, userData });

  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 0,
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [message, setMessage] = useState({ type: '', content: '' });

  useEffect(() => {
    if (userData) {
      setFormData({
        username: userData.username || '',
        email: userData.email || '',
        password: '',
        confirmPassword: '',
        phone: userData.phone || '',
        role: userData.role !== undefined ? userData.role : 0,
      });
      if (userData.avatar) {
        setSelectedImage(userData.avatar);
      } else {
        setSelectedImage('../f9486eb3ce64ea88043728ffe70f0ba1.jpg');
      }
    }
  }, [userData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'role' ? parseInt(value, 10) : value,
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAvatarFile(file);
      setSelectedImage(URL.createObjectURL(file));
    }
  };

  const UpateAvata = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', content: '' });

    if (formData.password && formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', content: 'Mật khẩu xác nhận không khớp!' });
      return;
    }

    let payload;
    const dataToSend = {
      username: formData.username,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
    };

    if (formData.password) {
      dataToSend.password = formData.password;
    }

    if (avatarFile) {
      payload = new FormData();
      Object.keys(dataToSend).forEach((key) => payload.append(key, dataToSend[key]));
      payload.append('avatar', avatarFile);
    } else {
      payload = dataToSend;
    }

    try {
      await updateUser({ id: userId, ...payload }).unwrap();
      toast.success('Cập nhật người dùng thành công!');
      setTimeout(() => {
        navigate('/admin/listuser');
      }, 1500);
    } catch (err) {
      console.error('Lỗi cập nhật user:', err);
      setMessage({ type: 'error', content: err.data?.message || err.message || 'Có lỗi xảy ra khi cập nhật.' });
      toast.error(err.data?.message || 'Có lỗi xảy ra khi cập nhật.');
    }
  };

  const handleDeleteUser = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này không?')) {
      try {
        await deleteUser(userId).unwrap();
        toast.success('Xóa người dùng thành công!');
        navigate('/admin/listuser');
      } catch (err) {
        console.error('Lỗi khi xóa user:', err);
        toast.error(err.data?.message || 'Có lỗi xảy ra khi xóa người dùng.');
      }
    }
  };

  if (isLoadingUser) {
    console.log('Rendering: Loading user data...');
    return <p>Đang tải thông tin người dùng...</p>;
  }
  if (isUserError) {
    console.error('Rendering: Error loading user data.');
    return <p className="text-danger">Lỗi khi tải thông tin người dùng.</p>;
  }

  if (!userData) {
    console.warn('Rendering: No user data available after loading/error checks. Not rendering form.');
    return <p>Không tìm thấy thông tin người dùng hoặc dữ liệu không hợp lệ.</p>;
  }

  console.log('Rendering: Update form UI');

  return (
    <>
      <div className="admin-main-content">
        <div className="Create-user">
          <div className="card p-4">
            <div className="d-flex justify-content-between mb-3">
              <button
                className="btn btn-secondary"
                onClick={() => navigate('/admin/listuser')}
                disabled={isUpdating || isDeleting}
              >
                <i className="fas fa-arrow-left"></i> Quay lại
              </button>
              <div>
                <button
                  type="submit"
                  form="updateUserForm"
                  className="btn btn-primary me-2"
                  disabled={isUpdating || isDeleting}
                >
                  {isUpdating ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save"></i> Lưu Update
                    </>
                  )}
                </button>
                <button className="btn btn-danger" onClick={handleDeleteUser} disabled={isUpdating || isDeleting}>
                  {isDeleting ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      Đang xóa...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-trash"></i> Xóa User
                    </>
                  )}
                </button>
              </div>
            </div>

            {message.content && (
              <div className={`alert ${message.type === 'error' ? 'alert-danger' : 'alert-success'}`}>
                {message.content}
              </div>
            )}

            <form id="updateUserForm" onSubmit={handleSubmit}>
              <div className="input-create mb-3">
                <label className="form-label">Họ tên</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Nhập họ tên"
                  required
                />
              </div>

              <div className="input-create mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Nhập Email"
                  required
                />
              </div>

              <div className="input-create mb-3">
                <label className="form-label">Mật Khẩu Mới (để trống nếu không đổi)</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Nhập mật khẩu mới"
                />
              </div>

              <div className="input-create mb-3">
                <label className="form-label">Xác nhận Mật Khẩu Mới</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Nhập lại mật khẩu mới"
                />
              </div>

              <div className="input-create mb-3">
                <label className="form-label">Số điện thoại</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Nhập số điện thoại"
                />
              </div>

              <div className="input-create mb-3">
                <label className="form-label">Role</label>
                <select name="role" value={formData.role} onChange={handleChange} className="form-select">
                  <option value={0}>USER</option>
                  <option value={1}>ADMIN</option>
                </select>
              </div>

              <div className="input-create mb-3 text-center">
                <label className="form-label d-block">Avatar</label>
                <div className="update-avatar-container" onClick={UpateAvata} style={{ cursor: 'pointer' }}>
                  {selectedImage ? (
                    <img src={selectedImage} alt="avatar" className="avatar-preview" />
                  ) : (
                    <img src="../f9486eb3ce64ea88043728ffe70f0ba1.jpg" alt="avatar" />
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="form-control mt-2"
                  style={{ display: 'none' }}
                  onChange={handleImageChange}
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default UpdateUser;
