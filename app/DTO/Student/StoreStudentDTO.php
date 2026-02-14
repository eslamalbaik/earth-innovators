<?php

namespace App\DTO\Student;

use App\DTO\BaseDTO;

class StoreStudentDTO extends BaseDTO
{
    public string $name;
    public string $email;
    public ?string $phone;
    public string $password;
    public int $schoolId;
    public int $points = 0;
    public ?int $year = null;

    public static function fromRequest(array $data, int $schoolId): self
    {
        $dto = new self();
        $dto->name = $data['name'];
        $dto->email = $data['email'];
        $dto->phone = $data['phone'] ?? null;
        $dto->password = $data['password'];
        $dto->schoolId = $schoolId;
        $dto->points = 0;
        $dto->year = isset($data['year']) && $data['year'] ? (int) $data['year'] : null;

        return $dto;
    }
}

