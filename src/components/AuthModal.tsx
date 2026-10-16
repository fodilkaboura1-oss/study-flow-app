import React, { useState } from 'react';
import { api } from '../services/api.ts';
import type { User, Specialty, AcademicLevel } from '../types/index.ts';
import { X, Lock, Mail, User as UserIcon, GraduationCap, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  isDayMode?: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  specialties: Specialty[];
  levels: AcademicLevel[];
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  isDayMode = false,
  onClose,
  onSuccess,
  specialties,
  levels,
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('fodilkaboura1@gmail.com');
  const [password, setPassword] = useState('student123');
  const [name, setName] = useState('');
  const [specialtyId, setSpecialtyId] = useState(specialties[0]?.id || 'spec-management');
  const [levelId, setLevelId] = useState(levels[2]?.id || 'lvl-l3');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isRegister) {
        const res = await api.register({
          name,
          email,
          password,
          specialtyId,
          levelId,
        });
        onSuccess(res.user);
      } else {
        const res = await api.login(email, password);
        onSuccess(res.user);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'فشل تسجيل الدخول، تحقق من البيانات المدخلة');
    } finally {
      setLoading(false);
    }
  };

  const setPresetUser = (type: 'student' | 'admin') => {
    if (type === 'student') {
      setEmail('fodilkaboura1@gmail.com');
      setPassword('student123');
    } else {
      setEmail('admin@univ-alger.dz');
      setPassword('admin123');
    }
    setIsRegister(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div
        className={`relative w-full max-w-md border rounded-3xl shadow-2xl p-6 text-right overflow-hidden transition-colors ${
          isDayMode
            ? 'bg-white border-slate-200 text-slate-800'
            : 'bg-slate-900 border-slate-800 text-slate-100'
        }`}
      >
        <div
          className={`flex items-center justify-between pb-4 border-b ${
            isDayMode ? 'border-slate-200' : 'border-slate-800'
          }`}
        >
          <button
            onClick={onClose}
            className={`p-1 rounded-lg transition ${
              isDayMode
                ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <h2
              className={`text-xl font-bold ${
                isDayMode ? 'text-slate-900' : 'text-white'
              }`}
            >
              {isRegister ? 'إنشاء حساب طالب جديد' : 'تسجيل الدخول إلى StudyFlow'}
            </h2>
            <div
              className={`p-2 rounded-lg ${
                isDayMode
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-indigo-600/20 text-indigo-400'
              }`}
            >
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Quick Demo Credentials Selector */}
        {!isRegister && (
          <div
            className={`mt-4 p-3 rounded-xl border text-xs ${
              isDayMode
                ? 'bg-slate-50 border-slate-200'
                : 'bg-slate-800/60 border-slate-700/60'
            }`}
          >
            <p
              className={`mb-2 font-medium ${
                isDayMode ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              حسابات تجريبية سريعة بنقرة واحدة:
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPresetUser('student')}
                className={`flex-1 py-1.5 px-2 border rounded-lg text-center transition flex items-center justify-center gap-1.5 ${
                  isDayMode
                    ? 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-800 font-semibold'
                    : 'bg-indigo-950/80 hover:bg-indigo-900 border-indigo-700/50 text-indigo-200'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                حساب الطالب (فوديل كابورة)
              </button>
              <button
                type="button"
                onClick={() => setPresetUser('admin')}
                className={`flex-1 py-1.5 px-2 border rounded-lg text-center transition flex items-center justify-center gap-1.5 ${
                  isDayMode
                    ? 'bg-sky-50 hover:bg-sky-100 border-sky-200 text-sky-800 font-semibold'
                    : 'bg-sky-950/80 hover:bg-sky-900 border-sky-700/50 text-sky-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                إدارة الكلية (رسمي)
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-800 rounded-xl text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {isRegister && (
            <div>
              <label
                className={`block text-xs font-medium mb-1 ${
                  isDayMode ? 'text-slate-700' : 'text-slate-300'
                }`}
              >
                الاسم الكامل
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: فاضل قبورة"
                  className={`w-full border rounded-xl py-2.5 px-3 pr-10 text-sm focus:outline-none focus:border-indigo-500 ${
                    isDayMode
                      ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white'
                      : 'bg-slate-950 border-slate-700 text-white placeholder-slate-500'
                  }`}
                />
                <UserIcon className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
              </div>
            </div>
          )}

          <div>
            <label
              className={`block text-xs font-medium mb-1 ${
                isDayMode ? 'text-slate-700' : 'text-slate-300'
              }`}
            >
              البريد الإلكتروني الجامعي
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@univ.dz"
                className={`w-full border rounded-xl py-2.5 px-3 pr-10 text-sm focus:outline-none focus:border-indigo-500 ${
                  isDayMode
                    ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white'
                    : 'bg-slate-950 border-slate-700 text-white placeholder-slate-500'
                }`}
              />
              <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
            </div>
          </div>

          <div>
            <label
              className={`block text-xs font-medium mb-1 ${
                isDayMode ? 'text-slate-700' : 'text-slate-300'
              }`}
            >
              كلمة المرور
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full border rounded-xl py-2.5 px-3 pr-10 text-sm focus:outline-none focus:border-indigo-500 ${
                  isDayMode
                    ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white'
                    : 'bg-slate-950 border-slate-700 text-white placeholder-slate-500'
                }`}
              />
              <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
            </div>
          </div>

          {isRegister && (
            <>
              <div>
                <label
                  className={`block text-xs font-medium mb-1 ${
                    isDayMode ? 'text-slate-700' : 'text-slate-300'
                  }`}
                >
                  التخصص الأكاديمي
                </label>
                <select
                  value={specialtyId}
                  onChange={(e) => setSpecialtyId(e.target.value)}
                  className={`w-full border rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-indigo-500 ${
                    isDayMode
                      ? 'bg-slate-50 border-slate-300 text-slate-900'
                      : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                >
                  {specialties.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className={`block text-xs font-medium mb-1 ${
                    isDayMode ? 'text-slate-700' : 'text-slate-300'
                  }`}
                >
                  المستوى الدراسي
                </label>
                <select
                  value={levelId}
                  onChange={(e) => setLevelId(e.target.value)}
                  className={`w-full border rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-indigo-500 ${
                    isDayMode
                      ? 'bg-slate-50 border-slate-300 text-slate-900'
                      : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                >
                  {levels.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-xl text-sm transition shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2"
          >
            {loading ? 'جاري التحقق...' : isRegister ? 'إنشاء الحساب والمزامنة' : 'تسجيل الدخول'}
          </button>
        </form>

        <div
          className={`mt-4 pt-4 border-t text-center ${
            isDayMode ? 'border-slate-200' : 'border-slate-800'
          }`}
        >
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold transition"
          >
            {isRegister ? 'لديك حساب بالفعل؟ تسجيل الدخول' : 'ليس لديك حساب؟ إنشاء حساب طالب جديد'}
          </button>
        </div>
      </div>
    </div>
  );
};
