import { useState } from 'react';
import { FaSearch, FaPlus, FaMinus } from 'react-icons/fa';

export default function TeachersFilters({
    filters,
    onFilterChange,
    filterOptions = {}
}) {
    const [expandedSections, setExpandedSections] = useState({
        city: true,
        subject: false,
        stage: false,
        experience: false,
        price: false,
        rating: false,
        sessions: false
    });

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const cities = Array.isArray(filterOptions.cities) ? filterOptions.cities : [];
    const subjects = Array.isArray(filterOptions.subjects) ? filterOptions.subjects : [];
    const stages = Array.isArray(filterOptions.stages) ? filterOptions.stages : [];
    const experienceRanges = Array.isArray(filterOptions.experienceRanges) ? filterOptions.experienceRanges : [];
    const priceRanges = Array.isArray(filterOptions.priceRanges) ? filterOptions.priceRanges : [];
    const ratings = Array.isArray(filterOptions.ratings) ? filterOptions.ratings : [];
    const sessionRanges = Array.isArray(filterOptions.sessionRanges) ? filterOptions.sessionRanges : [];

    const FilterSection = ({ title, sectionKey, items, searchPlaceholder }) => {
        const safeItems = Array.isArray(items) ? items : [];

        return (
            <div className="border border-gray-200 py-3 rounded-lg p-3">
                <button
                    onClick={() => toggleSection(sectionKey)}
                    className="w-full flex items-center justify-between"
                >
                    <h3 className="text-md font-bold text-gray-900">{title}</h3>
                    <div className="flex items-center gap-2">
                        {expandedSections[sectionKey] ? (
                            <FaMinus className="text-gray-400 text-xs" />
                        ) : (
                            <FaPlus className="text-gray-400 text-xs" />
                        )}
                    </div>
                </button>

                {expandedSections[sectionKey] && (
                    <div className="space-y-4 my-2">
                        {searchPlaceholder && (
                            <div className="relative border border-gray-300 rounded-lg">
                                <input
                                    type="text"
                                    placeholder={searchPlaceholder}
                                    className="w-full  text-gray-900 px-3 py-2 pe-10 rounded-lg border-0 focus:ring-2 focus:ring-yellow-400 focus:outline-none "
                                />
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            </div>
                        )}

                        <div className="space-y-3">
                            {safeItems.length > 0 ? (
                                safeItems.map((item) => {
                                    const filterValue = filters[sectionKey];
                                    const isArray = Array.isArray(filterValue);
                                    const isChecked = isArray
                                        ? filterValue.includes(item.value)
                                        : filterValue === item.value;

                                    return (
                                        <label key={item.value} className="flex items-center justify-between cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    value={item.value}
                                                    checked={isChecked}
                                                    onChange={(e) => {
                                                        const currentValue = filters[sectionKey];
                                                        let newValue;

                                                        if (Array.isArray(currentValue)) {
                                                            if (e.target.checked) {
                                                                newValue = [...currentValue, item.value];
                                                            } else {
                                                                newValue = currentValue.filter(v => v !== item.value);
                                                            }
                                                        } else {
                                                            newValue = e.target.checked ? [item.value] : '';
                                                        }

                                                        onFilterChange(sectionKey, newValue, item.label);
                                                    }}
                                                    className="w-4 h-4 text-yellow-600 bg-gray-100 border-gray-300 rounded focus:ring-yellow-500"
                                                />
                                                <span className="text-gray-900 font-medium text-sm">{item.label}</span>
                                            </div>
                                            <span className="text-sm text-gray-500">({item.count || 0})</span>
                                        </label>
                                    );
                                })
                            ) : (
                                <p className="text-sm text-gray-500 text-center py-2">لا توجد خيارات متاحة</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-md font-bold text-gray-900 mb-2 ">فلترة المعلمين</h2>
                <div className="mb-4">
                    <div className="relative border border-gray-300 rounded-lg">
                        <input
                            type="text"
                            placeholder="ابحث باسم المعلم ..."
                            value={filters.search}
                            onChange={(e) => onFilterChange('search', e.target.value, e.target.value)}
                            className="w-full  text-gray-900 px-3 py-2 pe-10 rounded-lg border-0 focus:ring-2 focus:ring-yellow-400 focus:outline-none "
                        />
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                </div>
            </div>
            <FilterSection
                title="المدينة"
                sectionKey="city"
                items={cities}
                searchPlaceholder="ابحث باسم المدينة ..."
            />

            <FilterSection
                title="المادة الدراسية"
                sectionKey="subject"
                items={subjects}
            />

            <FilterSection
                title="المراحل الدراسية"
                sectionKey="stage"
                items={stages}
            />

            <FilterSection
                title="سنوات الخبرة"
                sectionKey="experience"
                items={experienceRanges}
            />

            <FilterSection
                title="السعر لكل ساعة"
                sectionKey="price"
                items={priceRanges}
            />

            <FilterSection
                title="التقييم"
                sectionKey="rating"
                items={ratings}
            />

            <FilterSection
                title="عدد الحصص"
                sectionKey="sessions"
                items={sessionRanges}
            />
        </div>
    );
}
