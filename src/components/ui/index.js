/**
 * Componentes UI Bases
 * Solo exportaciones - cada componente está en su archivo individual
 */

// Importar todos los componentes
import { Button } from './Button.jsx';
import { Input } from './Input.jsx';
import { Select } from './Select.jsx';
import { Textarea } from './Textarea.jsx';
import { Card } from './Card.jsx';
import { Badge } from './Badge.jsx';
import { Spinner } from './Spinner.jsx';
import { Modal } from './Modal.jsx';
import { Alert } from './Alert.jsx';
import { Avatar } from './Avatar.jsx';
import { Skeleton } from './Skeleton.jsx';
import { Divider } from './Divider.jsx';
import { Table, TableHeader, TableBody, TableCell, TableSkeleton } from './Table.jsx';

// Exportar individualmente
export { Button };
export { Input };
export { Select };
export { Textarea };
export { Card };
export { Badge };
export { Spinner };
export { Modal };
export { Alert };
export { Avatar };
export { Skeleton };
export { Divider };
export { Table, TableHeader, TableBody, TableCell, TableSkeleton };

// Exportar como objeto UI para compatibilidad con el código existente
export const UI = {
    Button,
    Input,
    Select,
    Textarea,
    Card,
    Badge,
    Spinner,
    Modal,
    Alert,
    Avatar,
    Skeleton,
    Divider,
    Table,
    TableHeader,
    TableBody,
    TableCell,
    TableSkeleton,
};

export default UI;