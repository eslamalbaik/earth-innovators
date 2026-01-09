import { useState, useMemo, useEffect } from 'react';
import { FaChevronLeft, FaCheck, FaStar, FaXmark, FaCalendar, FaClock, FaCalendarDays, FaChevronRight, FaPlus } from 'react-icons/fa6';
import axios from 'axios';
import { getInitials, getColorFromName } from '@/utils/imageUtils';

const formatLocation = (location) => {
    if (!location) return '';

    const generalStages = ['الابتدائية', 'المتوسطة', 'الثانوية', 'الجامعية'];

    if (location.includes(' - ')) {
        const [city, stagesPart] = location.split(' - ');
        if (!stagesPart) return city;

        const stages = stagesPart.split(' / ').map(s => s.trim());
        const generalStagesOnly = stages.filter(stage => generalStages.includes(stage));

        if (generalStagesOnly.length > 0) {
            return `${city} - ${generalStagesOnly.join(' / ')}`;
        }
        return city;
    }

    return location;
};

const getImageUrl = (teacher) => {
    if (teacher.image) {
        if (teacher.image.startsWith('http://') || teacher.image.startsWith('https://')) {
            return teacher.image;
        }
        if (teacher.image.startsWith('/storage/')) {
            return teacher.image;
        }
        return `/storage/${teacher.image}`;
    }

    if (teacher.user?.image) {
        if (teacher.user.image.startsWith('http://') || teacher.user.image.startsWith('https://')) {
            return teacher.user.image;
        }
        if (teacher.user.image.startsWith('/storage/')) {
            return teacher.user.image;
        }
        return `/storage/${teacher.user.image}`;
    }

    return null;
};

const normalizeSubjects = (subjects, subject) => {
    const isValidSubjectString = (str) => {
        if (!str || typeof str !== 'string') return false;
        const trimmed = str.trim();
        if (trimmed.length === 0 || trimmed.length > 100) return false;
        if (trimmed.length < 2) return false;
        if (/^[\[\]\\",\s\u0000-\u001F]+$/.test(trimmed)) return false;
        if (trimmed.includes('\\u') || trimmed.includes('\\"')) return false;
        return /^[\u0600-\u06FF\s\w\-]+$/.test(trimmed);
    };

    let processedSubjects = [];

    if (Array.isArray(subjects) && subjects.length > 0) {
        processedSubjects = subjects.filter(isValidSubjectString).map(s => s.trim());
    } else if (typeof subjects === 'string') {
        const trimmed = subjects.trim();
        if (trimmed.startsWith('[') || trimmed.startsWith('"')) {
            try {
                const parsed = JSON.parse(subjects);
                if (Array.isArray(parsed)) {
                    processedSubjects = parsed.filter(isValidSubjectString).map(s => s.trim());
                }
            } catch (e) {
            }
        } else if (isValidSubjectString(subjects)) {
            processedSubjects = [subjects.trim()];
        }
    }

    if (processedSubjects.length === 0 && subject) {
        if (typeof subject === 'string') {
            const trimmed = subject.trim();
            if (trimmed.includes(',')) {
                processedSubjects = trimmed.split(',').map(s => s.trim()).filter(isValidSubjectString);
            } else if (isValidSubjectString(trimmed)) {
                processedSubjects = [trimmed];
            }
        } else if (Array.isArray(subject)) {
            processedSubjects = subject.filter(isValidSubjectString).map(s => s.trim());
        }
    }

    return processedSubjects.filter((s, index, self) => self.indexOf(s) === index);
};

export default function BookingModal({ teacher, isOpen, onClose, restoredState = null }) {
    const subjects = useMemo(() => normalizeSubjects(teacher.subjects, teacher.subject), [teacher.subjects, teacher.subject]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedSessions, setSelectedSessions] = useState([]);
    const [viewMode, setViewMode] = useState('schedule');
    const [showBookedSessions, setShowBookedSessions] = useState(true);
    const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
    const [selectedDay, setSelectedDay] = useState(null);
    const [availabilities, setAvailabilities] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [imageError, setImageError] = useState(false);
    const [bookingSubmitting, setBookingSubmitting] = useState(false);
    const [bookingMessage, setBookingMessage] = useState(null);
    const [bookingError, setBookingError] = useState(null);

    // استعادة الحالة المحفوظة عند فتح الـ modal
    useEffect(() => {
        if (isOpen && restoredState) {
            console.log('Restoring booking state:', restoredState);
            if (restoredState.selectedSubject) {
                setSelectedSubject(restoredState.selectedSubject);
            }
            if (restoredState.selectedSessions && restoredState.selectedSessions.length > 0) {
                setSelectedSessions(restoredState.selectedSessions);
            }
            if (restoredState.viewMode) {
                setViewMode(restoredState.viewMode);
            }
            if (restoredState.currentWeekOffset !== undefined) {
                setCurrentWeekOffset(restoredState.currentWeekOffset);
            }
        }
    }, [isOpen, restoredState]);

    useEffect(() => {
        if (isOpen && subjects.length > 0) {
            // إذا لم تكن هناك حالة مستعادة، استخدم أول مادة
            if (!restoredState || !restoredState.selectedSubject) {
                setSelectedSubject(subjects[0]);
            }
        } else if (!isOpen) {
            setSelectedSubject('');
            setSelectedSessions([]);
            setBookingError(null);
            setBookingMessage(null);
        }
    }, [subjects, isOpen, restoredState]);

    const fetchAvailabilities = async () => {
        if (!selectedSubject) return;

        setLoading(true);
        setError(null);
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() + (currentWeekOffset * 7));

            const response = await axios.get(`/teachers/${teacher.id}/availabilities`, {
                params: {
                    date: startDate.toISOString(),
                    subject: selectedSubject
                }
            });

            if (response.data.success) {
                setAvailabilities(response.data.availabilities || {});
            }
        } catch (err) {
            console.error('Error fetching availabilities:', err);
            setError('فشل تحميل المواعيد');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && teacher.id && selectedSubject) {
            fetchAvailabilities();
        }
    }, [isOpen, currentWeekOffset, teacher.id, selectedSubject]);

    const generateTimeSlotsFromAPI = (date) => {
        const slots = [];
        const dateKey = date.toISOString().split('T')[0];
        const dayAvailabilities = availabilities[dateKey] || [];

        dayAvailabilities.forEach(avail => {
            slots.push({
                id: avail.id,
                time: avail.time,
                status: avail.status,
                dateKey: dateKey
            });
        });

        if (slots.length === 0) {
            slots.push({
                id: `${dateKey}-none`,
                time: '',
                status: 'unavailable',
                dateKey: dateKey
            });
        }

        return slots;
    };

    const calendarData = useMemo(() => {
        const baseDate = new Date();
        const weekStart = new Date(baseDate);
        weekStart.setDate(baseDate.getDate() + (currentWeekOffset * 7));

        const weekDays = [];
        for (let i = 0; i < 5; i++) {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + i);

            const dayNames = ['الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
            const dayName = dayNames[i];
            const day = date.getDate();
            const month = date.getMonth() + 1;

            weekDays.push({
                id: date.toISOString(),
                displayName: `${dayName} ${month}/${day}`,
                fullDate: date,
                dateKey: `${day}/${month}/${date.getFullYear()}`,
                timeSlots: generateTimeSlotsFromAPI(date)
            });
        }
        return weekDays;
    }, [currentWeekOffset, availabilities]);

    const handleTimeSlotClick = (dayData, slot) => {
        if (slot.status === 'unavailable' || slot.status === 'booked') return;

        // استخدام availabilityId كمعرف فريد للموعد (نفس الموعد لا يمكن حجزه مرتين بغض النظر عن المادة)
        const isAlreadySelected = selectedSessions.some(s => s.availabilityId === slot.id);

        if (isAlreadySelected) {
            // إزالة الموعد المختار
            setSelectedSessions(selectedSessions.filter(s => s.availabilityId !== slot.id));
        } else {
            // إضافة الموعد الجديد
            const sessionId = `${dayData.id}-${slot.id}-${selectedSubject}`;
            const newSession = {
                id: sessionId,
                date: dayData.displayName,
                fullDate: dayData.fullDate,
                time: slot.time,
                dateKey: dayData.dateKey,
                availabilityId: slot.id,
                subject: selectedSubject
            };
            setSelectedSessions([...selectedSessions, newSession]);
        }
        setBookingError(null);
    };

    const isSlotSelected = (dayData, slot) => {
        // التحقق من وجود availabilityId في المواعيد المختارة (بغض النظر عن المادة)
        return selectedSessions.some(s => s.availabilityId === slot.id);
    };

    const goToPreviousWeek = () => {
        setCurrentWeekOffset(currentWeekOffset - 1);
    };

    const goToNextWeek = () => {
        setCurrentWeekOffset(currentWeekOffset + 1);
    };

    const goToNearestAvailable = () => {
        const today = new Date();
        const nearestDate = calendarData.find(day =>
            day.timeSlots.some(slot =>
                slot.status === 'available' &&
                new Date(day.fullDate) >= today
            )
        );

        if (nearestDate) {
            setSelectedDay(nearestDate.id);
            const element = document.getElementById(`day-${nearestDate.id}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    };

    const dateRangeDisplay = useMemo(() => {
        if (calendarData.length === 0) return '';

        const monthNames = [
            'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
            'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
        ];

        const firstDay = calendarData[0].fullDate;
        const lastDay = calendarData[calendarData.length - 1].fullDate;

        const firstMonth = monthNames[firstDay.getMonth()];
        const lastMonth = monthNames[lastDay.getMonth()];

        return `${firstDay.getDate()} ${firstMonth} ${firstDay.getFullYear()} - ${lastDay.getDate()} ${lastMonth} ${lastDay.getFullYear()}`;
    }, [calendarData]);

    const removeSession = (id) => {
        setSelectedSessions(selectedSessions.filter(session => session.id !== id));
    };

    const clearAllSessions = () => {
        setSelectedSessions([]);
    };

    const totalPrice = selectedSessions.length * teacher.price;

    const submitBookings = async () => {
        setBookingError(null);
        setBookingMessage(null);

        if (!selectedSubject) {
            setBookingError('يرجى اختيار المادة الدراسية أولاً.');
            return;
        }

        if (selectedSessions.length === 0) {
            setBookingError('يرجى اختيار موعد للحجز قبل المتابعة إلى الدفع.');
            return;
        }

        const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (token) {
            axios.defaults.headers.common['X-CSRF-TOKEN'] = token;
        }
        setBookingSubmitting(true);

        const bookingData = {
            sessions: selectedSessions.map(session => ({
                availability_id: session.availabilityId,
                subject: session.subject,
            })),
        };

        console.log('Sending booking request:', bookingData);

        try {
            const response = await axios.post('/bookings', bookingData);
            console.log('Booking response:', response.data);

            if (response.data?.success) {
                const bookingId = response.data?.data?.id;
                console.log('Booking ID from response:', bookingId);
                if (bookingId) {
                    console.log('Redirecting to payment page:', `/payment/${bookingId}`);
                    window.location.href = `/payment/${bookingId}`;
                    return;
                } else {
                    console.error('No booking ID in response:', response.data);
                    setBookingError('تم إنشاء الحجز لكن لم يتم العثور على رقم الحجز. يرجى التحقق من حجوزاتك.');
                }
            } else {
                console.error('Booking failed:', response.data);
                setBookingError(response.data?.message || 'تعذر إنشاء الحجز. يرجى المحاولة مرة أخرى.');
            }
        } catch (e) {
            console.error('Booking error:', e);
            console.error('Error response:', e?.response?.data);
            console.error('Error status:', e?.response?.status);

            if (e?.response?.status === 401) {
                // حفظ بيانات الحجز في sessionStorage
                const bookingState = {
                    teacher: {
                        id: teacher.id,
                        name: teacher.name,
                        image: teacher.image,
                        rating: teacher.rating,
                        location: teacher.location,
                        subjects: teacher.subjects,
                        subject: teacher.subject,
                        price: teacher.price,
                        studentsCount: teacher.studentsCount,
                        sessionsCount: teacher.sessionsCount,
                        experience: teacher.experience,
                        isVerified: teacher.isVerified,
                        bio: teacher.bio,
                    },
                    selectedSubject: selectedSubject,
                    selectedSessions: selectedSessions,
                    viewMode: viewMode,
                    currentWeekOffset: currentWeekOffset,
                    timestamp: Date.now()
                };

                try {
                    sessionStorage.setItem('pendingBooking', JSON.stringify(bookingState));
                    console.log('Booking state saved to sessionStorage');
                } catch (storageError) {
                    console.error('Failed to save booking state:', storageError);
                }

                const intended = encodeURIComponent('/dashboard');
                window.location.href = `/login?intended=${intended}`;
                return;
            } else if (e?.response?.data?.message) {
                setBookingError(e.response.data.message);
            } else {
                setBookingError('حدث خطأ أثناء إرسال الحجز. يرجى المحاولة مرة أخرى.');
            }
        } finally {
            setBookingSubmitting(false);
            setBookingMessage(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div onClick={onClose} className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-lg shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-gray-900">احجز موعد الحصة مع المعلم {teacher.name}:</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition duration-300"
                    >
                        <FaXmark className="text-2xl" />
                    </button>
                </div>

                <div className="grid grid-cols-3">
                    <div className="col-span-1 border-r border-gray-200 bg-gray-50 p-6 pe-2">
                        <div className="bg-white rounded-lg mb-2 shadow-sm">
                            <div className="p-4 flex items-center gap-4 border-gray-300 border-b-[1px]">
                                {getImageUrl(teacher) && !imageError ? (
                                    <img
                                        src={getImageUrl(teacher)}
                                        alt={teacher.name}
                                        className="w-16 h-16 rounded-full border-4 border-green-200 object-cover"
                                        onError={() => setImageError(true)}
                                    />
                                ) : (
                                    <div
                                        className="w-16 h-16 rounded-full border-4 border-green-200 flex items-center justify-center text-white font-bold text-xl"
                                        style={{
                                            background: `linear-gradient(135deg, ${getColorFromName(teacher.name)})`
                                        }}
                                    >
                                        {getInitials(teacher.name)}
                                    </div>
                                )}
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-gray-900">{teacher.name}</h3>
                                        <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                            <FaCheck className="text-white text-[8px]" />
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600">{formatLocation(teacher.location)}</p>
                                    <div className="flex items-center gap-1">
                                        <FaStar className="text-yellow-400 text-sm" />
                                        <span className="text-sm font-medium">{teacher.rating}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mb-4">
                                <div className="py-2 px-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-3">حدد المادة الدراسية:</label>
                                    {subjects.length > 0 ? (
                                        <div className="flex gap-2 flex-wrap">
                                            {subjects.map((subject, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => {
                                                        setSelectedSubject(subject);
                                                    }}
                                                    className={`flex items-center justify-center gap-2 px-3 py-1 rounded-md font-medium transition duration-300 ${selectedSubject === subject
                                                        ? 'bg-yellow-100 border border-yellow-500 text-black'
                                                        : 'bg-white border border-gray-400 text-gray-500 hover:bg-gray-300'
                                                        }`}
                                                >
                                                    {selectedSubject === subject &&
                                                        <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                                                            <FaCheck className="text-white text-[8px]" />
                                                        </div>}
                                                    {selectedSubject !== subject &&
                                                        <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center">
                                                        </div>
                                                    }
                                                    {subject}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">لا توجد مواد متاحة لهذا المعلم</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg mb-4 shadow-sm">
                            <div className="p-2 border-gray-300 border-b-[1px] pb-2 flex items-center justify-between mb-3">
                                <h3 className="font-bold text-gray-900 text-sm">الحصص التي تم اختيارها <span className="text-yellow-500">({selectedSessions.length})</span></h3>
                                {selectedSessions.length > 0 && (
                                    <button
                                        onClick={clearAllSessions}
                                        className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-600 rounded-lg text-xs font-medium hover:bg-red-200 transition duration-300"
                                    >
                                        <FaXmark />
                                        مسح الكل
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-2 items-center gap-2 p-2 max-h-[150px] overflow-y-auto ">
                                {selectedSessions.length === 0 ? (
                                    <div className="text-center py-6 col-span-2">
                                        <p className="text-gray-500 text-sm">لم يتم اختيار أي موعد</p>
                                    </div>
                                ) : (
                                    selectedSessions.map((session) => (
                                        <div key={session.id} className="border border-gray-700 flex items-center justify-between gap-4 bg-white rounded-lg p-2 py-1 shadow-sm">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{session.date}</p>
                                                <p className="text-xs text-gray-600">{session.time}</p>
                                                {session.subject && (
                                                    <p className="text-xs text-gray-500 mt-1">المادة: {session.subject}</p>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => removeSession(session.id)}
                                                className="text-gray-400 hover:text-red-500 transition duration-300"
                                            >
                                                <FaXmark />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            {bookingError && (
                                <div className="text-center text-sm text-red-600">{bookingError}</div>
                            )}
                            {bookingMessage && !bookingError && (
                                <div className="text-center text-sm text-gray-700">{bookingMessage}</div>
                            )}
                            <button
                                onClick={submitBookings}
                                disabled={bookingSubmitting || selectedSessions.length === 0}
                                className="w-full flex items-center justify-center bg-yellow-400 hover:bg-yellow-500 disabled:opacity-60 disabled:cursor-not-allowed text-black font-bold py-3 rounded-lg text-sm transition duration-300 transform hover:scale-105"
                            >
                                {bookingSubmitting ? 'جاري التوجيه إلى بوابة الدفع...' :
                                    <div className="text-sm font-bold text-gray-900 flex items-center gap-1">
                                        <span>أكمل الدفع بـ {totalPrice}</span>
                                        <img src="/images/aed-currency(black).svg" alt="currency" className="w-5 h-5" />
                                    </div>
                                }
                            </button>
                        </div>
                    </div>

                    <div className="col-span-2 overflow-y-auto p-6 ps-2 bg-gray-50">
                        <div className="bg-white shadow-sm rounded-xl">
                            <div className="border-gray-300 border-b-[1px] flex items-center justify-between gap-2 px-4 py-3">
                                <p className="">
                                    اختر المواعيد
                                </p>
                                <button
                                    onClick={goToNearestAvailable}
                                    className="bg-gray-100 rounded-lg px-2 py-1 text-sm border border-gray-700 shadow-md flex items-center gap-2 text-gray-600 hover:text-gray-900 transition duration-300"
                                >
                                    انتقل إلى أقرب حصة متاحة
                                    <FaChevronLeft className="text-xs" />
                                </button>
                            </div>

                            <div className="border-gray-300 border-b-[1px] flex items-center justify-between gap-2 px-4 py-3">
                                <div className="flex items-center justify-between gap-2">
                                    <button
                                        onClick={goToPreviousWeek}
                                        className="w-5 h-5 flex items-center justify-center border border-gray-400 rounded-full text-gray-600 hover:text-gray-900"
                                    >
                                        <FaChevronLeft className="rotate-180 text-xs" />
                                    </button>
                                    <h3 className="text-sm font-medium text-gray-900">{dateRangeDisplay}</h3>
                                    <button
                                        onClick={goToNextWeek}
                                        className="w-5 h-5 flex items-center justify-center border border-gray-400 rounded-full text-gray-600 hover:text-gray-900"
                                    >
                                        <FaChevronLeft className="text-xs" />
                                    </button>
                                </div>
                                <div className="flex gap-2 bg-white border border-gray-300 rounded-full px-1 py-1">
                                    <button
                                        onClick={() => setViewMode('schedule')}
                                        className={`text-sm flex items-center gap-2 px-2 py-0.5 rounded-full font-medium transition duration-300 ${viewMode === 'schedule'
                                            ? 'bg-yellow-100 text-yellow-500 border border-yellow-500'
                                            : 'text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        <FaCalendar />
                                        جدول
                                    </button>
                                    <button
                                        onClick={() => setViewMode('calendar')}
                                        className={`text-sm flex items-center gap-2 px-2 py-0.5 rounded-full font-medium transition duration-300 ${viewMode === 'calendar'
                                            ? 'bg-yellow-100 text-yellow-500 border border-yellow-500'
                                            : 'text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        <FaCalendarDays />
                                        تقويم
                                    </button>
                                </div>
                            </div>

                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="text-gray-500">جاري تحميل المواعيد...</div>
                                </div>
                            ) : error ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="text-red-500">{error}</div>
                                </div>
                            ) : viewMode === 'schedule' ? (
                                <ScheduleGridView
                                    calendarData={calendarData}
                                    selectedDay={selectedDay}
                                    setSelectedDay={setSelectedDay}
                                    selectedSessions={selectedSessions}
                                    handleTimeSlotClick={handleTimeSlotClick}
                                    isSlotSelected={isSlotSelected}
                                    showBookedSessions={showBookedSessions}
                                />
                            ) : (
                                <CalendarGridView
                                    calendarData={calendarData}
                                    selectedDay={selectedDay}
                                    setSelectedDay={setSelectedDay}
                                    selectedSessions={selectedSessions}
                                    handleTimeSlotClick={handleTimeSlotClick}
                                    isSlotSelected={isSlotSelected}
                                    showBookedSessions={showBookedSessions}
                                />
                            )}

                            <div className="flex items-center justify-between px-4 py-2">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={showBookedSessions}
                                        onChange={(e) => setShowBookedSessions(e.target.checked)}
                                        className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                                    />
                                    <span className="text-sm text-gray-700">إظهار الحصص المحجوزة</span>
                                </label>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <FaClock />
                                    <select className="border border-gray-300 rounded-lg px-4 py-1 text-sm">
                                        <option>الرياض</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ScheduleGridView({ calendarData, selectedDay, setSelectedDay, selectedSessions, handleTimeSlotClick, isSlotSelected, showBookedSessions }) {
    return (
        <div className="grid grid-cols-5 gap-4 px-4 py-3">
            {calendarData.map((dayData) => {
                const isDaySelected = selectedDay === dayData.id;
                const availableSlots = dayData.timeSlots.filter(slot => slot.status === 'available');
                const bookedSlots = dayData.timeSlots.filter(slot => slot.status === 'booked');
                const visibleSlots = showBookedSessions
                    ? dayData.timeSlots
                    : dayData.timeSlots.filter(slot => slot.status !== 'booked');

                return (
                    <div
                        key={dayData.id}
                        id={`day-${dayData.id}`}
                        className={`border rounded-lg transition-all ${isDaySelected
                            ? 'border-yellow-400 bg-yellow-50'
                            : 'border-gray-200'
                            }`}
                    >
                        <h4 className="bg-gray-100 p-2 rounded-t-lg font-medium text-sm text-gray-900 text-center">{dayData.displayName}</h4>
                        <div className="space-y-2 p-2">
                            {visibleSlots.length === 0 || visibleSlots.every(slot => slot.status === 'unavailable') ? (
                                <div className="flex flex-col items-center justify-center py-6">
                                    <img
                                        src="/images/avatar4.svg"
                                        alt="لا توجد حصص متاحة"
                                        className="w-16 h-16 opacity-50 mb-2"
                                    />
                                    <p className="text-sm text-gray-500 text-center">
                                        لا يوجد مواعيد متاحة حالياً
                                    </p>
                                </div>
                            ) : (
                                visibleSlots.map((slot) => {
                                    if (slot.status === 'unavailable') return null;

                                    const isSelected = isSlotSelected(dayData, slot);
                                    const isBooked = slot.status === 'booked';

                                    return (
                                        <button
                                            key={slot.id}
                                            onClick={() => handleTimeSlotClick(dayData, slot)}
                                            disabled={isBooked}
                                            className={`w-full py-2 rounded-lg text-sm font-medium transition duration-300 ${isBooked
                                                ? 'bg-white border border-gray-300 text-gray-400 cursor-not-allowed'
                                                : isSelected
                                                    ? 'bg-yellow-400 text-black hover:bg-yellow-500'
                                                    : 'bg-gray-100 text-gray-900 hover:bg-yellow-200'
                                                }`}
                                        >
                                            <span className={isBooked ? 'line-through' : ''}>
                                                {slot.time}
                                            </span>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function CalendarGridView({ calendarData, selectedDay, setSelectedDay, selectedSessions, handleTimeSlotClick, isSlotSelected, showBookedSessions }) {
    return (
        <div className="px-4 py-3 overflow-y-auto">
            <div className="grid grid-cols-5 gap-2 mb-2">
                {['الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map((dayName) => (
                    <div key={dayName} className="text-center font-bold text-gray-700">
                        {dayName}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-5 gap-2">
                {calendarData.map((dayData) => {
                    const isDaySelected = selectedDay === dayData.id;
                    const availableSlots = dayData.timeSlots.filter(slot => slot.status === 'available');
                    const visibleSlots = showBookedSessions
                        ? dayData.timeSlots
                        : dayData.timeSlots.filter(slot => slot.status !== 'booked');
                    const dayNumber = dayData.fullDate.getDate();

                    return (
                        <div
                            key={dayData.id}
                            onClick={() => setSelectedDay(dayData.id)}
                            className={`border rounded-lg p-3 cursor-pointer transition-all h-24 flex flex-col justify-between ${isDaySelected
                                ? 'border-yellow-400 bg-yellow-50'
                                : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className={`text-lg font-bold ${isDaySelected ? 'text-yellow-700' : 'text-gray-700'}`}>
                                    {dayNumber}
                                </span>
                                {availableSlots.length > 0 && (
                                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                        {availableSlots.length}
                                    </span>
                                )}
                            </div>

                            {availableSlots.length > 0 ? (
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {availableSlots.slice(0, 2).map((slot) => (
                                        <span key={slot.id} className="text-xs bg-gray-100 text-gray-600 px-1 py-0.5 rounded">
                                            {slot.time.split(' ')[0]}
                                        </span>
                                    ))}
                                    {availableSlots.length > 2 && (
                                        <span className="text-xs text-gray-500">+{availableSlots.length - 2}</span>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center text-sm flex flex-col items-center justify-center">
                                    <img
                                        src="/images/avatar4.svg"
                                        alt="لا توجد حصص لهذا اليوم"
                                        className="w-14 h-14 opacity-50"
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            {selectedDay && (() => {
                const selectedDayData = calendarData.find(d => d.id === selectedDay);
                const visibleSlotsForDay = selectedDayData?.timeSlots.filter(slot => {
                    if (!showBookedSessions && slot.status === 'booked') return false;
                    return slot.status !== 'unavailable';
                }) || [];

                return visibleSlotsForDay.length > 0 ? (
                    <div className="mt-6">
                        <h4 className="font-bold text-gray-900 mb-3">
                            الأوقات المتاحة ليوم {selectedDayData?.displayName}
                        </h4>
                        <div className="grid grid-cols-4 gap-2">
                            {visibleSlotsForDay.map((slot) => {
                                const isSelected = isSlotSelected(selectedDayData, slot);
                                const isBooked = slot.status === 'booked';

                                return (
                                    <button
                                        key={slot.id}
                                        onClick={() => handleTimeSlotClick(selectedDayData, slot)}
                                        disabled={isBooked}
                                        className={`py-2 rounded-lg text-sm font-medium transition duration-300 ${isBooked
                                            ? 'bg-white border border-gray-300 text-gray-400 cursor-not-allowed'
                                            : isSelected
                                                ? 'bg-yellow-400 text-black hover:bg-yellow-500'
                                                : 'bg-gray-100 text-gray-900 hover:bg-yellow-200'
                                            }`}
                                    >
                                        <span className={isBooked ? 'line-through' : ''}>
                                            {slot.time}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-sm flex flex-col items-center justify-center mt-6">
                        <img
                            src="/images/avatar4.svg"
                            alt="لا توجد حصص لهذا اليوم"
                            className="w-100 h-100 opacity-50"
                        />
                        <p className="mt-2">لا توجد حصص لهذا اليوم</p>
                    </div>
                );
            })()}
        </div>
    );
}

function StudentInfoModal({ open, onClose, studentInfo, setStudentInfo, errors, onSave }) {
    if (!open) return null;
    return (
        <div onClick={onClose} className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
            <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden">
                <div className="p-4 border-b border-gray-200 font-bold text-gray-900">بيانات الطالب</div>
                <div className="p-4 space-y-3">
                    <div>
                        <label className="block text-sm text-gray-700 mb-1">الاسم</label>
                        <input value={studentInfo.name} onChange={(e) => setStudentInfo({ ...studentInfo, name: e.target.value })} className="w-full border rounded px-3 py-2" />
                        {errors.name && <div className="text-xs text-red-600 mt-1">{errors.name}</div>}
                    </div>
                    <div>
                        <label className="block text-sm text-gray-700 mb-1">البريد الإلكتروني (اختياري)</label>
                        <input value={studentInfo.email} onChange={(e) => setStudentInfo({ ...studentInfo, email: e.target.value })} className="w-full border rounded px-3 py-2" />
                        {errors.email && <div className="text-xs text-red-600 mt-1">{errors.email}</div>}
                    </div>
                    <div>
                        <label className="block text-sm text-gray-700 mb-1">رقم الجوال (اختياري)</label>
                        <input value={studentInfo.phone} onChange={(e) => setStudentInfo({ ...studentInfo, phone: e.target.value })} className="w-full border rounded px-3 py-2" />
                        {errors.phone && <div className="text-xs text-red-600 mt-1">{errors.phone}</div>}
                    </div>
                    <div>
                        <label className="block text-sm text-gray-700 mb-1">ملاحظات (اختياري)</label>
                        <textarea value={studentInfo.notes} onChange={(e) => setStudentInfo({ ...studentInfo, notes: e.target.value })} className="w-full border rounded px-3 py-2" rows="3" />
                    </div>
                </div>
                <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 border rounded">إلغاء</button>
                    <button onClick={() => { if (onSave) onSave(); }} className="px-4 py-2 bg-yellow-500 text-white rounded">حفظ</button>
                </div>
            </div>
        </div>
    );
}

function SummaryView({ teacher, selectedSubject, selectedSessions, totalPrice, removeSession, onAddMore, onBook }) {
    return (
        <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-6 text-center">هذا ملخص للحجز الخاص بك</h3>

            <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h4 className="font-bold text-gray-900 mb-4">الحصص التي تم اختيارها ({selectedSessions.length})</h4>
                    <div className="space-y-2 mb-6">
                        {selectedSessions.map((session) => (
                            <div key={session.id} className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{session.subject || selectedSubject} - {session.date}</p>
                                    <p className="text-xs text-gray-600">{session.time}</p>
                                </div>
                                <button
                                    onClick={() => removeSession(session.id)}
                                    className="text-gray-400 hover:text-red-500"
                                >
                                    <FaXmark />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                        <div className="flex justify-between items-center mb-2">
                            <div className="text-sm font-bold text-gray-900 flex items-center ">
                                <p className="text-3xl font-bold text-gray-900 mt-2">{selectedSessions.length} حصص × {teacher.price}</p>
                                <img src="/images/aed-currency(black).svg" alt="currency" className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="text-sm font-bold text-gray-900 flex items-center ">
                                <span>الإجمالي = {totalPrice} </span>
                                <img src="/images/aed-currency(black).svg" alt="currency" className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            {getImageUrl(teacher) && !imageError ? (
                                <img
                                    src={getImageUrl(teacher)}
                                    alt={teacher.name}
                                    className="w-16 h-16 rounded-full border-4 border-green-200 object-cover"
                                    onError={() => setImageError(true)}
                                />
                            ) : (
                                <div
                                    className="w-16 h-16 rounded-full border-4 border-green-200 flex items-center justify-center text-white font-bold text-xl"
                                    style={{
                                        background: `linear-gradient(135deg, ${getColorFromName(teacher.name)})`
                                    }}
                                >
                                    {getInitials(teacher.name)}
                                </div>
                            )}
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-gray-900">{teacher.name}</h3>
                                    <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                        <FaCheck className="text-white text-[8px]" />
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600">{formatLocation(teacher.location)}</p>
                                <div className="flex items-center gap-1">
                                    <FaStar className="text-yellow-400 text-sm" />
                                    <span className="text-sm font-medium">{teacher.rating}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h4 className="font-bold text-gray-900 mb-2">المواد الدراسية</h4>
                        <p className="text-gray-700">
                            {[...new Set(selectedSessions.map(session => session.subject).filter(Boolean))].join(' / ') || selectedSubject}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex gap-4 mt-6">
                <button
                    onClick={onBook}
                    className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-4 rounded-lg text-lg transition duration-300"
                >
                    احجز الآن
                </button>
                <button
                    onClick={onAddMore}
                    className="flex items-center gap-2 px-6 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-4 rounded-lg transition duration-300"
                >
                    <FaPlus />
                    إضافة حصة أخرى
                </button>
            </div>
        </div>
    );
}
