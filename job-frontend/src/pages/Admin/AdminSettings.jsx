import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminJobs.css';

const AdminSettings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [adminInfo, setAdminInfo] = useState({
    name: '',
    email: '',
    username: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [systemSettings, setSystemSettings] = useState({
    siteName: 'Job Portal',
    maintenanceMode: false,
    allowRegistration: true,
    emailNotifications: true
  });

  // Load admin info
  useEffect(() => {
    fetchAdminInfo();
  }, []);

  const fetchAdminInfo = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      
      const response = await fetch('http://localhost:5000/api/admin/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAdminInfo({
          name: data.data.name || '',
          email: data.data.email || '',
          username: data.data.username || ''
        });
      }
    } catch (err) {
      console.error('Error fetching admin info:', err);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Mật khẩu mới không khớp!');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      alert('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      
      const response = await fetch('http://localhost:5000/api/admin/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      if (response.ok) {
        alert('Đổi mật khẩu thành công!');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        const data = await response.json();
        alert(data.message || 'Đổi mật khẩu thất bại!');
      }
    } catch (err) {
      console.error('Error changing password:', err);
      alert('Lỗi khi đổi mật khẩu!');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      
      const response = await fetch('http://localhost:5000/api/admin/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(adminInfo)
      });

      if (response.ok) {
        alert('Cập nhật thông tin thành công!');
      } else {
        alert('Cập nhật thông tin thất bại!');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Lỗi khi cập nhật thông tin!');
    } finally {
      setLoading(false);
    }
  };

  const handleSystemSettingsUpdate = () => {
    // Save to localStorage for now (in real app, save to backend)
    localStorage.setItem('systemSettings', JSON.stringify(systemSettings));
    alert('Cập nhật cài đặt hệ thống thành công!');
  };

  return (
    <div className="admin-jobs-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1> Cài đặt Admin</h1>
          <p>Quản lý cấu hình hệ thống và tài khoản</p>
        </div>
      </div>

      <div className="settings-container">
        {/* Profile Settings */}
        <div className="settings-card">
          <div className="card-header">
            <h2> Thông tin cá nhân</h2>
          </div>
          <div className="card-body">
            <form onSubmit={handleProfileUpdate}>
              <div className="form-group">
                <label>Họ tên:</label>
                <input
                  type="text"
                  value={adminInfo.name}
                  onChange={(e) => setAdminInfo({ ...adminInfo, name: e.target.value })}
                  placeholder="Nhập họ tên"
                />
              </div>

              <div className="form-group">
                <label>Username:</label>
                <input
                  type="text"
                  value={adminInfo.username}
                  disabled
                  className="input-disabled"
                />
                <small>Username không thể thay đổi</small>
              </div>

              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  value={adminInfo.email}
                  onChange={(e) => setAdminInfo({ ...adminInfo, email: e.target.value })}
                  placeholder="Nhập email"
                />
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Đang cập nhật...' : ' Lưu thay đổi'}
              </button>
            </form>
          </div>
        </div>

        {/* Password Change */}
        <div className="settings-card">
          <div className="card-header">
            <h2> Đổi mật khẩu</h2>
          </div>
          <div className="card-body">
            <form onSubmit={handlePasswordChange}>
              <div className="form-group">
                <label>Mật khẩu hiện tại:</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  placeholder="Nhập mật khẩu hiện tại"
                  required
                />
              </div>

              <div className="form-group">
                <label>Mật khẩu mới:</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                  required
                />
              </div>

              <div className="form-group">
                <label>Xác nhận mật khẩu mới:</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="Nhập lại mật khẩu mới"
                  required
                />
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Đang xử lý...' : ' Đổi mật khẩu'}
              </button>
            </form>
          </div>
        </div>

        {/* System Settings */}
        <div className="settings-card">
          <div className="card-header">
            <h2> Cài đặt hệ thống</h2>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label>Tên website:</label>
              <input
                type="text"
                value={systemSettings.siteName}
                onChange={(e) => setSystemSettings({ ...systemSettings, siteName: e.target.value })}
                placeholder="Tên website"
              />
            </div>

            <div className="toggle-group">
              <div className="toggle-item">
                <div>
                  <strong> Chế độ bảo trì</strong>
                  <p>Tắt trang web để bảo trì</p>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={systemSettings.maintenanceMode}
                    onChange={(e) => setSystemSettings({ ...systemSettings, maintenanceMode: e.target.checked })}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="toggle-item">
                <div>
                  <strong> Cho phép đăng ký</strong>
                  <p>Người dùng có thể tạo tài khoản mới</p>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={systemSettings.allowRegistration}
                    onChange={(e) => setSystemSettings({ ...systemSettings, allowRegistration: e.target.checked })}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="toggle-item">
                <div>
                  <strong> Thông báo email</strong>
                  <p>Gửi email thông báo tự động</p>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={systemSettings.emailNotifications}
                    onChange={(e) => setSystemSettings({ ...systemSettings, emailNotifications: e.target.checked })}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>

            <button 
              className="btn-primary" 
              onClick={handleSystemSettingsUpdate}
            >
               Lưu cài đặt
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="settings-card danger-zone">
          <div className="card-header">
            <h2> Vùng nguy hiểm</h2>
          </div>
          <div className="card-body">
            <p>Các hành động này có thể ảnh hưởng nghiêm trọng đến hệ thống.</p>
            
            <div className="danger-actions">
              <button 
                className="btn-danger"
                onClick={() => {
                  if (window.confirm('Bạn có chắc muốn xóa tất cả cache?')) {
                    localStorage.removeItem('systemSettings');
                    alert('Đã xóa cache!');
                  }
                }}
              >
                 Xóa cache hệ thống
              </button>

              <button 
                className="btn-danger"
                onClick={() => {
                  if (window.confirm('Bạn có chắc muốn đăng xuất khỏi tất cả thiết bị?')) {
                    alert('Tính năng này đang được phát triển!');
                  }
                }}
              >
                 Đăng xuất tất cả thiết bị
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;