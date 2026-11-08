import * as migration_20261108_052041_initial from './20261108_052041_initial';

export const migrations = [
  {
    up: migration_20261108_052041_initial.up,
    down: migration_20261108_052041_initial.down,
    name: '20261108_052041_initial'
  },
];
