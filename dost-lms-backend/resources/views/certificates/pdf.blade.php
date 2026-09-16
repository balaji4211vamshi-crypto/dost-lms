<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: 'Helvetica', sans-serif; text-align: center; margin-top: 120px; color: #1f2937; }
        .border { border: 6px double #1d4ed8; padding: 60px; }
        h1 { font-size: 14px; letter-spacing: 4px; text-transform: uppercase; color: #6b7280; }
        h2 { font-size: 32px; margin: 20px 0 4px; }
        .name { font-size: 28px; font-weight: bold; margin: 24px 0; color: #1d4ed8; }
        .course { font-size: 20px; margin-bottom: 24px; }
        .meta { font-size: 12px; color: #6b7280; margin-top: 40px; }
    </style>
</head>
<body>
    <div class="border">
        <h1>DOST Academy System</h1>
        <h2>Certificate of Completion</h2>
        <p>This certifies that</p>
        <div class="name">{{ $user->name }}</div>
        <p>has successfully completed the course</p>
        <div class="course">{{ $course->title }}</div>
        <p class="meta">
            Certificate No. {{ $certificate->certificate_number }} &middot;
            Issued {{ $certificate->issued_date->format('d M Y') }}
        </p>
    </div>
</body>
</html>
