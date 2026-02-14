<?php

namespace App\DTO\Student;

use App\DTO\BaseDTO;

class UpdateStudentDTO extends BaseDTO
{
    public string $name;
    public string $email;
    public ?string $phone;
    public ?string $password;
    public ?int $year = null;

    public static function fromRequest(array $data): self
    {
        $dto = new self();
        $dto->name = $data['name'];
        $dto->email = $data['email'];
        $dto->phone = $data['phone'] ?? null;
        $dto->password = $data['password'] ?? null;
        $dto->year = isset($data['year']) && $data['year'] ? (int) $data['year'] : null;

        return $dto;
    }
}

