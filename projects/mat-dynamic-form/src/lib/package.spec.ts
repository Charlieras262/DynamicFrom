declare const require: (path: string) => any;

const pkg = require('../../package.json');

/**
 * Every external package imported by the library must be a peer dependency, so apps use their own copy
 * (and tools such as bundlephobia do not count it as part of the library).
 * When the library starts importing a new package, add it here and to package.json.
 */
const ANGULAR_PEERS = [
  '@angular/animations',
  '@angular/cdk',
  '@angular/common',
  '@angular/core',
  '@angular/forms',
  '@angular/material',
  '@angular/platform-browser',
];

describe('package.json', () => {

  it('declares every Angular package the library imports as a peer dependency', () => {
    ANGULAR_PEERS.forEach(name => {
      expect(pkg.peerDependencies[name]).withContext(name).toBeDefined();
    });
  });

  it('uses the same supported range for every Angular peer dependency', () => {
    const coreRange = pkg.peerDependencies['@angular/core'];
    ANGULAR_PEERS.forEach(name => {
      expect(pkg.peerDependencies[name]).withContext(name).toBe(coreRange);
    });
  });

  it('declares rxjs as a peer dependency compatible with Angular 11 to 16', () => {
    expect(pkg.peerDependencies.rxjs).toBe('^6.5.3 || ^7.0.0');
  });

  it('does not bundle Angular packages or rxjs as regular dependencies', () => {
    const dependencies = Object.keys(pkg.dependencies ?? {});
    expect(dependencies.filter(name => name.startsWith('@angular/') || name === 'rxjs')).toEqual([]);
  });
});
