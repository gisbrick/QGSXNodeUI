/**
 * Componentes de administración de QGSXNodeUI
 * Todos los componentes requieren permisos de administrador
 */

export { AdminGuard } from './AdminGuard';

// Componentes CRUD unificados (recomendados)
export { AdministratorCRUD } from './AdministratorCRUD';
export { UnitCRUD } from './UnitCRUD';
export { UnitManagerCRUD } from './UnitManagerCRUD';

// Componentes individuales (legacy, mantenidos para compatibilidad)
export { CreateAdministrator } from './CreateAdministrator';
export { CreateUnit } from './CreateUnit';
export { CreateUnitManager } from './CreateUnitManager';
export { AdministratorList } from './AdministratorList';
export { UnitList } from './UnitList';
export { UnitManagerList } from './UnitManagerList';

export type { AdminGuardProps } from './AdminGuard';
export type { AdministratorCRUDProps, Administrator } from './AdministratorCRUD';
export type { UnitCRUDProps, Unit } from './UnitCRUD';
export type { UnitManagerCRUDProps, UnitManager, Unit as UnitManagerUnit } from './UnitManagerCRUD';
export type { CreateAdministratorProps } from './CreateAdministrator';
export type { CreateUnitProps } from './CreateUnit';
export type { CreateUnitManagerProps, Unit as CreateUnitManagerUnit } from './CreateUnitManager';
export type { AdministratorListProps, Administrator as AdministratorListItem } from './AdministratorList';
export type { UnitListProps, Unit as UnitListUnit } from './UnitList';
export type { UnitManagerListProps, UnitManager as UnitManagerListItem, Unit as UnitManagerListUnit } from './UnitManagerList';

