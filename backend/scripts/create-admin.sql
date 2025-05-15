-- Script para crear un administrador por defecto
-- Credenciales: admin@admin.com / pass

-- Verificar si ya existe el administrador para evitar duplicados
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM "Administradores" WHERE email = 'admin@admin.com') THEN
        -- Insertar el administrador con rol superadmin
        INSERT INTO "Administradores" (nombre_usuario, email, contrasena, rol)
        VALUES ('Administrador', 'admin@admin.com', 'pass', 'superadmin');
        
        RAISE NOTICE 'Administrador creado exitosamente';
    ELSE
        RAISE NOTICE 'El administrador ya existe';
    END IF;
END $$;
